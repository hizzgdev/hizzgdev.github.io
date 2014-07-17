---
layout: detail
title: 永远的重构[1]-两种WebService的调用方式
---
案例背景
==========================

在一个系统集成的项目(Java)里，一个WebApp(A)需要向其它WebApp同步推送基础数据。解决方案是这样的：

首先A提供一个接口，其它WebApp以此接口实现各自的数据处理逻辑，并将该接口的实现类发布为WebService，A访问这些WebService，按照定义的接口将数据推送给这些WebApp。

在系统联调时发现，与其它JavaEE应用集成很容易，但与一个使用Python开发的应用集成时却总是报错。经过不断的调试，项目组发现关键所在：

A连接WebService时使用的是cxf框架，cxf提供了两种访问远程WebService的方法，一种是基于JaxWsProxyFactoryBean类生成本地的代理类，另一种是使用JaxWsDynamicClientFactory类动态invoke方法，使用这两种方法均能与JavaEE应用正常集成，但要集成Python应用的话只能使用后者。

这应该只是一个表面现象，但由于时间关系并没有继续研究。不过此问题并不是我们今天要讨论的重点。以下是这两种方法的示例代码：

方法一：使用JaxWsProxyFactoryBean类

    ```Java
    JaxWsProxyFactoryBean svr = new JaxWsProxyFactoryBean();
    // BizService 是A应用提供的接口
    svr.setServiceClass(BizService.class);
    svr.setAddress("http://localhost:8080/BizService");
    // 连接远程 WebService，生成本地代理类
    BizService service = (BizService) svr.create();
    // 调用远程 WebService 的 PushData 方法
    service.PushData(...);
    // 调用远程 WebService 的 PushData2 方法
    service.PushData2(...);
    ```


方法二：使用JaxWsDynamicClientFactory类

    JaxWsDynamicClientFactory dcf = JaxWsDynamicClientFactory.newInstance();
    // 连接远程 WebService
    Client client = dcf.createClient("http://localhost:8080/BizService?wsdl"); 
    // 调用远程 WebService 的 PushData 方法
    client.invoke("PushData",...);
    // 调用远程 WebService 的 PushData2 方法
    client.invoke("PushData2",...);


不合适的解决办法
==========================

使用方法二对A进行重构：

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

项目组增加了一个新的连接WebService的方法，再在代码中把原来大量的基于接口的方法调用`service.PushData(...)`换成了`client.invoke("PushData",...)`。

这种做法虽然能够解决问题，但是却会留下了一些隐患，具体有以下五点：

1. 问题发生的本质原因并不清楚，贸然使用新的方法或许将会产生不可预料的后果；
2. 使用这种方式进行修改，涉及的代码太多，一旦出现错误，不方便撤销修改；
3. 新的方法使用`invoke`方式进行调用，调用的方法是通过参数来控制的，IDE不能在编译期发现错误；
4. 如果以后有些应用只兼容第一种方法，则代码还需要重新设计；
5. 如果以后有些应用不能提供WebService，则代码还需要重新设计。

比较好的重构方法
==========================

其实这个场景是进行代码重构的一个绝佳机会，重构其实就是对代码的一次重新设计，不仅要解决当前问题，还要考虑对以后的影响，尽可能的减少后续维护的难度。

为保证代码稳定，重构时应尽量对程序进行扩展，而不是对程序进行修改，于是考虑尽量不改变原来程序中对WebService的调用方法。首先将原来的getService改造成一个工厂方法，在这个方法中按照一定的规则采用不同的方式连接WebService；其次对Client对象进行包装，使其看起来不是一个Client而是一个BizService，这样就可以把重构限制在这两个类中了。具体的重构方法如下所示：

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
            // 在这个方法中可以大做文章：
            // 可以根据不同的ip使用不同的连接方式
            // 还可以根据配置文件统一切换连接方式
            // return getServiceProxyBean(ip,port);
            return getServiceDynamicProxyBean(ip,port);
        }
    }

同时增加了一个包装类，把Client包装成了一个Service：

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

采用这种方式进行重构，原有相关调用不需要进行任何修改，减少了过多改动带来的风险；其次由于逻辑清晰，进行调试时也比较容易；更重要的是这次重构为这个功能增加了很多扩展的可能。

1. 如果使用过程中有问题，可以很快切换成之前的方法；
2. 通过建立规则可实现连接不同的应用时使用不同的方法；
3. 通过建立规则可实现切换不同的连接方法；
4. 通过建立包装类，可以对WebSerice的调用进行日志记录，也避免了由于WebService的错误而使自己的应用出现异常；
5. 通过建立不同的包装类，可以进行WebService之外的其它形式的连接；

思考
==========================

重构只是一次重新的设计，软件质量的好坏其实都是设计出来的，但是设计的好处往往不是能立即呈现的。在本例中，如果使用项目组刚开始的做法，或许也不会出问题，但是我们总要考虑这些万一，甚至还给自己提一些额外的假设。面对一个需要快速交付的项目，或许你不能做出一个最完美的程序，但是你的程序一定是可以不断地升级完美的，只要你进行了合理的设计，实现过程中进行了合理的重构。

需要提醒的是，不能过度设计，重构首先是为了解决眼前的问题，其次才是兼顾未来，不要为了目前不存在的需求花费过多的精力，考虑未来的变化因素，留好对应的插口，以后再实现。

本文章是重构系列的第一篇文章，希望能够与你形成共识。
