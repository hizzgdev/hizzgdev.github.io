---
layout: detail
title: 利用404页面在Github上搭建博客
---
相对于在一些博客提供商上写博客，在GitHub上写博客有很多好处，比如每篇文章都有版本记录，对文章的备份和整理都比较方便等。

具体来说，在GitHub上写博客有两类解决方案。一是使用Jekyll搭建静态博客，这也是GitHub官方提供的方案，具体的使用方法可以参见阮一峰的这篇文章[《搭建一个免费的，无限流量的Blog----github Pages和Jekyll入门》][1]；二是利用GitHub提供的API，编写javascript搭建Ajax博客，具体可以采用[sneezry的Hooloo解决方案][2]。

前者实际上是GitHub把文章进行了静态化，对搜索引擎比较友好；后者则可以利用Ajax的特性，使博客更加轻便灵动。两者不好比较优劣，如同sneezry在[《在GitHub上按前端的方式舒服地写博客》][3]里所说：`作为一个以前端自居的程序员，就一定要有彻头彻尾的前端的方法来实现`，所以就不用刻意地去比较了。

本文介绍了利用GitHub API搭建博客的另一种方案，中间参考了很多sneezry的解决思路。

GitHub Pages提供了自定义404页面的功能，只要在你的项目根目录添加一个404.html就可以了，当访问一个不存在的页面时，GitHub将会响应一个404的状态码，具体页面则是你自定义的404.html，重要的是，GitHub并不是重定向到404.html，而是将404.html作为了这个不存在的页面。换句话讲，此时你的浏览器上的路径不是404.html，而是你原来访问的那个不存在的路径。

这就意味着，利用此特性，可以使用javascript实现一个完整的博客网站：

1. 所有博客文章都存放到/blog/目录下（或者其它你喜欢的目录），以.md为后缀名；
2. 新建/blog/index.html页面，利用GitHub提供的API，查询/blog/目录里的所有文章；
3. 在页面上显示文章列表，文章的链接地址由.md改为.html（或者其它你希望的后缀名）；
4. 在404.html里获取用户要访问的地址，利用GitHub提供的API检查文件是否存在；
5. 如果文件不存在，再检查对应的.md文件是否存在，并利用GitHub API读取.md文件；
6. 利用javascript版的Markdown解析工具对.md内容进行处理，显示到404页面上；
7. 为提高效率，可利用localStorage缓存GitHub API响应的结果。

坦白地讲，此解决方案并不实用，一是每一篇博客的响应码全都是404，有悖404的原本意义，而且对搜索引擎b也可能不太友好；二是打开所有博客页面时都需要再次发起一个ajax请求，一定程序上增加了浏览器与服务器的负担；三是过多地依赖客户端的javascript，对项目来说是个巨大的风险。因此，此解决方案更多的也只是一种设计思路而已。

由于实现方案比较简单，相应的代码不再列出，感兴趣的朋友可以参考本博客的[这个历史版本][4]，真要写博客建议还是选择Jekyll或者Hooloo方案。

[1]:http://www.ruanyifeng.com/blog/2012/08/blogging_with_jekyll.html
[2]:https://github.com/sneezry/Hooloo
[3]:http://szy.me/q3p
[4]:https://github.com/hizzgdev/hizzgdev.github.io/tree/77d3a982541c5bd14fa66da2b8ae82272ce3f1e5
