---
layout: detail
title: 利用404页面在Github上搭建博客
---
相对于在一些博客提供商上写博客，在GitHub上写博客有很多好处，比如有每篇文章都有版本记录，文章的备份、整理比较方便等。

在GitHub上写博客可以使用GitHub推荐的Jekyll解决方案，具体的使用方法可以参见阮一峰的这篇文章[《搭建一个免费的，无限流量的Blog----github Pages和Jekyll入门》][1]；或者利用GitHub提供的API实现一个Ajax的博客，可以采用[sneezry的Hooloo解决方案][2]。

受sneezry这篇文章[《在GitHub上按前端的方式舒服地写博客》][3]的启发，考虑可以利用GitHub Pages的404页面实现博客文章的伪静态，就避免了Hooloo解决方案中利用404进行一次跳转的过程。以此思路，可以对Hooloo的解决方案进行如下改造：

1. 所有博客文章都存放到/blog/目录下（或者其它你喜欢的目录），以.md为后缀名；
2. 新建/blog/index.html页面，利用GitHub提供的API，列出/blog/目录里的所有文章；
3. 将上一步列出的文章链接地址后缀名改为.html（或者其它你希望的后缀名）；
4. 添加/404.html处理上一步那些不存在的路径，将请求的路径修改为.md后缀，利用GitHub API读取.md文件；
5. 利用javascript版的Markdown解析工具对.md内容进行处理，显示到404页面上；
6. 利用localStorage缓存GitHub API响应的结果以提高响应速度。

代码比较简单，不再列出。有兴趣者可以分析本页面的源文件获取更多信息。

[1]:http://www.ruanyifeng.com/blog/2012/08/blogging_with_jekyll.html
[2]:https://github.com/sneezry/Hooloo
[3]:http://szy.me/q3p
