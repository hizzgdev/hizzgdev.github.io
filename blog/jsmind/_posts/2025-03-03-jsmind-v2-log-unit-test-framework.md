---
layout: detail
title: jsMind V2 开发记录 - from jest to node test runner
sn: 209
---

Jest 对 ES module 的支持
===

在之前的文章里我提到，jsMind V2 使用 [Jest](https://jestjs.io/) 框架来写单元测试，这是一个很成熟且广泛使用的框架，文档和教程很丰富，遇到问题也容易找到对应的解决方案。

但它对 ES Module 还没有正式支持，截止到2025年3月的最新版本 29.7 （以及 Next 版本），它的文档 [ECMAScript Modules](https://jestjs.io/docs/ecmascript-modules) 里仍然是：

```
Jest ships with experimental support for ECMAScript Modules (ESM).
```

而不巧的是，jsMind 用的正是 ES6，而且没有使用 babel 进行“编译”，所以在使用 jest 时需要一些额外的工作：

1. test script 不能是 `jest`, 而需要换成 `NODE_OPTIONS="$NODE_OPTIONS --experimental-vm-modules" jest`
2. mock ES6 module 的时候不能直接 `jest.mock(..)`，而要写成 `jest.unstable_mockModule()`

Nodejs 的内置测试框架
===

上文中提到的 `--experimental-vm-modules` 其实是 node 的命令行参数，这个参数在 node v23.x 的时候被删除了，这意味着从 v23.x 开始，Node 正式支持了 ES Module。

那除了 jest 之外，是否有其它的单元测试框架能够更好地支持 ES Module 呢？经过搜索，找到了这篇文章，[Testing in Node: A Comparison of the Top 9 Libraries](https://betterstack.com/community/guides/testing/best-node-testing-libraries/)，里面提到：

```
Node.js has historically relied on third-party testing libraries. However, with the introduction of Node.js v18, the landscape underwent a significant shift. Node.js shipped with an experimental built-in test runner, which received stabilization status in Node.js 20. This move aimed to minimize reliance on third-party dependencies. 
```

原来 v20.x 的时候，Node 已经正式推出了 [Test Runner](https://nodejs.org/docs/latest/api/test.html) 和 [Assertion](https://nodejs.org/docs/latest/api/assert.html)。

jsMind V2 Unit Test 代码迁移
===

把 jest 代码改写成 node test 并不需要很高的学习成本，两者区别最大的是 assertion 的写法。

```javascript
// jest
import { expect } from '@jest/globals';
expect(root.children.length).toBe(2);

// node test
import assert from 'node:assert/strict';
assert.strictEqual(root.children.length, 2);
```

mock 的写法也不太一样。

```javascript
import TestClass from '--module--path--';

// jest
const mockedSomeMethod = jest.fn();
jest.unstable_mockModule('--module--path--', () => {
    someMethod: mockedSomeMethod
});

// node test
const mockedSomeMethod = mock.method(testClass, 'someMethod');
```

jsMind V2 的 test 代码迁移到了 node test 框架下，并把 jest 从项目的依赖中移除了。

其他
===
* 尚未验证 node test 是否支持浏览器 dom 相关的测试。
* VS Code 里有一个插件叫 [node:test runner](https://marketplace.visualstudio.com/items?itemName=connor4312.nodejs-testing) 。使用它能比较方便地运行测试并查看代码覆盖率。