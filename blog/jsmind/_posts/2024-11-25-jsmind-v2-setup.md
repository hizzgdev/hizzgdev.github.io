---
layout: detail
title: jsMind V2 开发记录 - 基础设施
---

# 开源
jsMind V2 仍然是开源的，源码仍然托管在 GitHub 上，但使用了一个新的 repo: [jsmind-v2](https://github.com/hizzgdev/jsmind-v2), 这样可以避免影响到 jsMind 目前的版本。

# 基础设置

## gitignore
这是一个 javascript 项目，使用 npm 来管理项目依赖，因此将 `node_modules` 添加到了 .gitignore 文件里。

## eslint
[ESLint](https://eslint.org/) 是一个代码静态检查工具，在项目最开始的时候引入它，将有助于保持代码的风格统一。

## jest
[Jest](https://jestjs.io/) 是一个轻量级的 js 测试框架，完善的单元测试是软件质量的有效保证。

## vscode setting
VS Code 可以从项目的 `.vscode` 目录中读取配置，因此在此项目里，定义了项目的用户字典，并且设置了自动对文件进行格式化。

# 未完成的基础设置

- 项目的重要文件
    - README
    - LICENSE
- eslint
    - 尚未能支持对 `.json` 文件的格式检查
    - 尚未能支持对 `.md` 文件的格式检查
- package.json
    - 待项目开发过程中逐步完善各项设置
