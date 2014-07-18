---
layout: detail
title: 利用404页面在Github上搭建博客
---
相对于在一些博客提供商上写博客，在GitHub上写博客有很多好处，比如每篇文章都有版本记录，对文章的备份和整理都比较方便等。

一般来说，在GitHub上写博客可以使用Jekyll搭建静态博客，具体作法可以参考阮一峰的这篇文章[《搭建一个免费的，无限流量的Blog----github Pages和Jekyll入门》][1]。另外，还有一些技术爱好者利用GitHub提供的API，使用javascript搭建博客，例如[sneezry的Hooloo解决方案][2]，作者在[《在GitHub上按前端的方式舒服地写博客》][3]这篇文章中介绍了Hooloo的主要实现原理，并提到了GitHub Pages的自定义404页面的功能。

GitHub Pages提供自定义404页面的功能，只要在你的项目根目录添加一个名为404.html的文件就可以了，当访问的页面不存在时，GitHub将会使用该文件作为响应，在该文件中可以使用javascript获取用户请求的路径。利用自定义404页面的功能，甚至可以实现与Jekyll同样的效果，关键是根据Url找到对应的文章，并利用javascript解析Markdown语法。以下是一个具体的实现思路：

1. 所有博客文章都存放到同一个目录下，文件名的规则为`日期-标题.md`，如`/blog/20140716-测试的文章标题.md`；
2. 在/blog/index.html页面里，利用GitHub提供的API，查询/blog/目录里的所有文章；
3. 根据文件名提取文章的日期、标题，按你喜欢的格式构建文章路径，例如`/YYYY/MM/DD/标题.html`；
4. 由于上一步中构建的链接地址实际上并不存在，因此对这些地址的访问都会显示404.html里的内容；
5. 在404页面中根据用户访问的地址计算得出文章的真实路径，例如`/YYYY/MM/DD/标题.html`对应的博客文件路径是`/blog/YYYYMMDD-标题.md`；
6. 利用GitHub提供的API读取对应文章内容，使用javascript的Markdown解析工具对文章内容进行解析并显示；
7. 为提高效率，可利用localStorage缓存GitHub API响应的结果。

由于实现方案比较简单，相应的代码不再列出，感兴趣的朋友可以参考本博客的[这个历史版本][4]。

事实上，此解决方案并不实用，一是每一篇博客的HTTP状态码都是404，而不是正常的200，有悖404的原本意义，对搜索引擎也可能不太友好；二是过多地依赖客户端的javascript会带来的一定的风险。然而多思考多尝试总是好的，正如sneezry所追求的："[*作为一个以前端自居的程序员，就一定要有彻头彻尾的前端的方法来实现*][3]"。

[1]:http://www.ruanyifeng.com/blog/2012/08/blogging_with_jekyll.html
[2]:https://github.com/sneezry/Hooloo
[3]:http://szy.me/q3p
[4]:https://github.com/hizzgdev/hizzgdev.github.io/tree/77d3a982541c5bd14fa66da2b8ae82272ce3f1e5

