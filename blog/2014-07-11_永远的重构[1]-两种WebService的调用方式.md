在一个系统集成的项目(Java)里，一个WebApp(A)需要向其它WebApp推送一些数据。为了实现这一功能，A应用提供了一个接口，要求其它WebApp以此接口实现各自的数据处理逻辑，并将该接口的实现类发布为WebService，再在A应用里配置WebService的访问路径，这样A应用就可以依次访问这些WebService，将数据推送给这些WebApp了。

在系统联调时，A应用很快完成了与其它4个JavaEE应用的集成，但当与第5个应用集成时却出现了问题，原来第5个应用是使用Python开发的，5号应用的开发者使用soaplib发布了对应的WebService，但是A应用调用时却总是报错。经过不断的调试，项目组分析得出如下结论：

A应用使用cxf连接远程WebService，cxf提供了两种访问远程WebService的方法，分别使用了JaxWsProxyFactoryBean和JaxWsDynamicClientFactory两个类，A应用使用的是前者，如果换成后者就能正常的连接5号应用的WebService了。以下是这两种方法的示例代码：

方法一：JaxWsProxyFactoryBean

    JaxWsProxyFactoryBean svr = new JaxWsProxyFactoryBean();
    // BizService 是A应用提供的接口
    svr.setServiceClass(BizService.class);
    svr.setAddress("http://localhost:8080/BizService");
    // 连接远程 WebService
    BizService service = (BizService) svr.create();
    // 调用远程 WebService 的 PushData 方法
    service.PushData(...);
    // 调用远程 WebService 的 PushData2 方法
    service.PushData2(...);

方法二：JaxWsDynamicClientFactory

    JaxWsDynamicClientFactory dcf = JaxWsDynamicClientFactory.newInstance();
    // 连接远程 WebService
    Client client = dcf.createClient("http://localhost:8080/BizService?wsdl"); 
    // 调用远程 WebService 的 PushData 方法
    client.invoke("PushData",...);
    // 调用远程 WebService 的 PushData2 方法
    client.invoke("PushData2",...);

为了实现与5号应用的集成，项目组决定使用方法二重构A应用以达到更高的兼容性。作为技术管理者，在项目组提交代码前浏览了一下项目组的具体实现方法，发现项目组把对WebService的连接过程包装成了独立的方法，把代码中原来大量的基于接口的方法调用`service.PushData(...)`换成了`client.invoke("PushData",...)`，签出了好多版本控制下的文件。

修改后的程序大致是这个样子：

    // WebServiceUtil.java
    public class WebServiceUtil{
        // 原来获取WebService引用的方法
        public static BizService getService(String ip, String port){
            JaxWsProxyFactoryBean svr = new JaxWsProxyFactoryBean();
            svr.setServiceClass(BizService.class);
            svr.setAddress("http://"+ip+":"+port+"/BizService");
            BizService service = (BizService) svr.create();
            return service;
        }

        // 原来的方法没有删除，添加了新的获取WebService引用的方法
        public static Client getServiceClient(String ip, String port){
            JaxWsDynamicClientFactory dcf = JaxWsDynamicClientFactory.newInstance();
            Client client = dcf.createClient("http://"+ip+":"+port+"/BizService?wsdl"); 
            return client;
        }
    }

    // XXService.java 其中的一处调用
    public void SomeMethod(){
        ...
        // 原来的代码
        // BizService service = WebServiceUtil.getService(app.getIp(),app.getPort());
        // service.PushData(data);

        // 修改后的代码
        Client client = WebServiceUtil.getServiceClient(app.getIp(),app.getPort());
        client.invoke("PushData",data);
    }

立即叫停了项目组的这种做法，原因主要有四点：

1.新的方法仅在5号应用中进行过实验，并未经过大量的测试，贸然修改将会产生不可预料的后果
2.使用这种方式进行修改，涉及的代码太多，一旦出现错误，不方便撤销修改
3.新的方法使用invoke方式进行调用，一旦参数错误，将会出现运行期错误，而不能在编译期发现
4.如果以后的6号应用必须使用第一种方法，则还要对代码进行大量修改，才能兼顾5号6号两个应用

其实这个场景是一个进行代码重构的最好机会，而且还能借此机会改善之前的代码的缺陷，试想当某次调用失败时如何记录这些错误失败的日志，而这些日志信息往往是在系统集成中非常重要的数据，可以帮助我们排查错误，分清责任。然后要想能够记录这些日志，无论采用原方法还是新方法，均要在很多地方加入try...catch...才能实现。

最好的解决办法是这样的：

    // WebServiceUtil.java
    public class WebServiceUtil{
        // 原来获取WebService引用的方法
        // 将原方法改名为getServiceProxyBean
        public static BizService getServiceProxyBean(String ip, String port){
            JaxWsProxyFactoryBean svr = new JaxWsProxyFactoryBean();
            svr.setServiceClass(BizService.class);
            svr.setAddress("http://"+ip+":"+port+"/BizService");
            BizService service = (BizService) svr.create();
            // 此service如果进行一下简单的包装就能实现记录错误日志的功能了
            return service;
        }

        // 添加了新的获取WebService引用的方法
        // 但是返回的不是Client类型，而同样是BizService类型
        public static BizService getServiceDynamicProxyBean(String ip, String port){
            JaxWsDynamicClientFactory dcf = JaxWsDynamicClientFactory.newInstance();
            Client client = dcf.createClient("http://"+ip+":"+port+"/BizService?wsdl"); 
            // 我们自己创建一个实现类包装这个client对象
            return new BizServiceDynamicProxy(client);
        }

        // 添加新的工厂方法，方法名为getService
        // 这样原来的代码就不需要进行任何修改了
        public static BizService getService(String ip, String port){
            // 在这个方法中可以大做文章
            // 可以根据不同的ip使用不同的连接方式
            // 还可以根据配置文件统一切换连接方式
            // 在此就不再进行详细解释了。
            //return getServiceProxyBean(ip,port);
            return getServiceDynamicProxyBean(ip,port);
        }
    }


    // BizServiceDynamicProxy.java
    public BizServiceDynamicProxy implements BizService{
        Client _client = null;
        public BizServiceDynamicProxy(Client client){
            _client = client;
        }

        @override
        public void PushData(Objcect data){
            try{
                return _client.invoke("PushData",data);
            }catch(Exception e){
                // logging
            }
        }

        @override
        public void PushData2(Objcect data){
            try{
                return _client.invoke("PushData2",data);
            }catch(Exception e){
                // logging
            }
        }

        // 其它方法实现
        ...
    }

采用这种方式进行重构，不仅原有的相关调用不需要进行任何修改，项目组也觉得这种方式不仅节省了调试时间，还使代码逻辑更加清晰，最重要的是为应用增加了更多可扩展的特性，例如：

1.为不同的应用以不同的方式进行连接；
2.通过实现类包装，避免由于WebService的发布方的错误使自己的应用出现异常；
3.通过加入日志记录，记录具体的错误，便于分清责任；
4.扩展更多的实现方式，即使以后不使用WebService也能比较方便地进行扩展。

这其实只是一次普通的代码重构，如果不这么做，也不见得就会给项目组带来什么麻烦，然而，如果不这么做，代码就会这么慢慢的变坏，随着时间的推移，这些坏代码越来越多，最终会导致软件无法维护。

本文章是重构系列的第一篇文章，以此案例告诉大家，重构其实不见得需要大量的改动，只要你有一颗重构的心，你的团队将会永远受益。
