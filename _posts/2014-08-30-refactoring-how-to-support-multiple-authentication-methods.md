---
layout: detail
title: 永远的重构[2]-如何支持多种认证方法
---
项目初期，用户要求软件需要支持密码/UKey两种身份认证方式，并向管理员提供一个变更认证方式的配置，包括三个选项：使用密码认证/使用UKey认证/同时使用密码和UKey认证。这里的同时是指，用户需要插入UKey并输入正确的密码才允许登录软件。

项目组于是提供了三个选项，并按照这三种方式分别实现了不同的登录验证方法：

    public AuthResult Auth(HttpServletRequest request, HttpServletResponse response){
        // 读取当前设置的认证方式
        AuthOption option = ...
        // 选择进入不同的认证方法
        if(option == AuthOption.PASSWORD){
            return AuthByPassword(request,response);
        }else if(option == AuthOption.CA){
            return AuthByCA(request,response);
        }else if(option == AuthOption.PASSWORD_CA){
            return AuthByPasswordAndCA(request,response);
        }
    }

    private AuthResult AuthByPassword(...)...
    private AuthResult AuthByCA(...)...
    private AuthResult AuthByPasswordAndCA(...)...

项目上线后，用户新引进了一套动态口令系统，于是要求软件支持密码、UKey、动态口令三种方式的任何组合对用户进行复合身份认证。按照项目组目前实现的方法，要满足用户的要求，需要2^3个选项，不仅配置上看起来不清晰，程序逻辑也将显得非常臃肿。

对此代码的重构分为三个部分：调整配置参数，实现三个单纯的认证方式，根据配置进行组合认证。

首先将配置选项改为三组：启用密码认证/启用UKey认证/启用动态口令认证，对应的AuthOption由原来的枚举变更为一个类：

    class AuthOption{
        public boolean EnablePassword;
        public boolean EnableCA;
        public boolean EnableDP;
    }

其次，完成三个单纯的认证方法：

    private AuthResultItem AuthByPassword(...)...
    private AuthResultItem AuthByCA(...)...
    private AuthResultItem AuthByDP(...)...

最后，重构组合认证方法：

    public AuthResult Auth(...)
        AuthResult result = new AuthResult();
        if(AuthOption.EnablePassword){
            result.Add(AuthByPassword(...));
        }
        if(AuthOption.EnableCA){
            result.Add(AuthByCA(...));
        }
        if(AuthOption.EnableDP){
            result.Add(AuthByDP(...));
        }
        return result
    }

*对应的 AuthResult 类也应该同时进行重构。*

这样重构后基本可以满足用户提出的需求，如果将来用户再提出要接入其它的认证方式，可以再继续按照抽象工厂的模式重构：

1. 定义认证基类 Authentication，包含一个抽象的 Auth 方法;
2. 实现 PasswordAuthentication/CAAuthentication/DPAuthentication/其它认证类;
3. 通过配置文件描述这些实现类，并利用反射实例化;
4. 根据用户的配置调用不同的实现类进行认证;

这样的话就将认证的实现与认证过程进行了解耦，用户要接入其它的认证方法，只需按照认证基类实现具体的认证类即可。

提醒各位读到这里的朋友，项目研发中不要过度设计，比如在此案例中，用户应该不会再接入其它的认证方式了，如果按抽象工厂的方式进行重构，则非常不经济。能够满足需求，能够支持进一步的重构即可。
