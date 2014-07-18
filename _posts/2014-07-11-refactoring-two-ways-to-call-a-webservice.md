---
layout: detail
title: 永远的重构[1]-两种WebService的调用方式
---
案例背景
==========================

在一个系统集成的项目(Java)里，A应用需要向其它应用同步推送基础数据。为此A应用提供了一个接口，要求其它应用以此接口实现各自的数据处理类，并将该类发布为WebService，A应用访问这些WebService，即可将数据推送给这些应用。

A应用使用cxf框架连接WebService，cxf提供了两种访问WebService的方法，一是基于JaxWsProxyFactoryBean类生成本地的代理类，二是使用JaxWsDynamicClientFactory类动态invoke方法，以下是这两种方法的示例代码：

方法一：使用JaxWsProxyFactoryBean类

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

方法二：使用JaxWsDynamicClientFactory类

    JaxWsDynamicClientFactory dcf = JaxWsDynamicClientFactory.newInstance();
    // 连接远程 WebService
    Client client = dcf.createClient("http://localhost:8080/BizService?wsdl"); 
    // 调用远程 WebService 的 PushData 方法
    client.invoke("PushData",...);
    // 调用远程 WebService 的 PushData2 方法
    client.invoke("PushData2",...);

由于A应用提供了统一的接口，于是很自然选择了第一种方式，然而实际联调时发现，第一种方式只能与JavaEE应用集成，却不能集成Python应用，而第二种方式却能同时兼容JavaEE应用和Python应用，由于时间比较紧，项目组并没有仔细研究第一种方式失败的原因，而是计划使用第两种方法对程序进行重构。

第一次重构
==========================

项目组首先重构了WebService的连接类，添加了新的连接方法：

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

        // 添加新的获取WebService引用的方法
        public static Client getServiceClient(String ip, String port){
            JaxWsDynamicClientFactory dcf = JaxWsDynamicClientFactory.newInstance();
            Client client = dcf.createClient("http://"+ip+":"+port+"/BizService?wsdl"); 
            return client;
        }
    }

其次，修改系统中所有与该WebService调用相关的类：

    // XXService.java 其中的一处调用
    public void SomeMethod(){
        ...
        // 注释掉原来的代码
        // BizService service = WebServiceUtil.getService(app.getIp(),app.getPort());
        // service.PushData(data);

        // 添加新调用代码
        Client client = WebServiceUtil.getServiceClient(app.getIp(),app.getPort());
        client.invoke("PushData",data);
    }

这种做法虽然解决了项目组的问题，但是作为重构却是最差的一种方法：不但没有带来程序结构的优化，而且还增加了代码的出错机率。具体表现在新的方法使用`invoke`方式进行调用，这种方式通过一个字符串类型的参数指定调用哪一个方法，将导致IDE不能在编译期发现是否存在该方法，而增加程序的出错机率。

重构时应尽量扩展，而不是修改：在本例中可以以扩展的方式进行重构，将原本只支持一种方法改为同时支持两种方法，并对第二种方法进行包装，使其不会改变原有的调用代码，减少重构对原程序带来的影响。

优化过的重构
==========================

首先重构连接WebService的工具类：

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

        // 添加新的工厂方法，方法名为getService，这样原来的调用代码就不需要进行任何修改了
        public static BizService getService(String ip, String port){
            // 在这个方法中可以大做文章，可以根据不同的规则切换不同的连接方式，不过目前我们只需要把它改成第二种方式即可。
            // return getServiceProxyBean(ip,port);
            return getServiceDynamicProxyBean(ip,port);
        }
    }

其次，增加了一个包装类，用于把第二种方法中的Client包装成第一种方法中的Service：

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

只需这两步即可完成重构，这样修改完成后，原有相关调用不需要进行任何修改，减少了过多改动带来的风险，而且优化了程序结构，为日后的修改或扩展提供了更多的可能，如：

1. 如果使用过程中有问题，可以很快切换成之前的方法；
2. 通过建立规则可实现连接不同的应用时使用不同的方法；
3. 通过建立规则可实现全局切换不同的连接方法；
4. 通过建立包装类，可以对WebSerice的调用进行日志记录，也避免了由于WebService的错误而使自己的应用出现异常；
5. 通过建立不同的包装类，可以进行WebService之外的其它形式的连接；

思考
==========================

重构其实是对软件局部的一次重新的设计，好的重构会不断优化设计从而提供软件质量，不好的重构则会使软件陷入越来越混乱的泥潭，并最终导致代码无法维护。程序员是要有所追求的。

