---
layout: detail
title: jsMind V2 开发记录 - 模块与交互
sn: 210
---

![image](/blog/jsmind/images/2025/modules.png)

设想
===

在 jsMind V1 中，修改节点文本的 API 实现如下：

```javascript
// initialize a jsmind object
const jsmind = new jsMind(...);

// create a new node
const node = jsmind.add_node('root-node-id', 'node1', 'topic of node1')

// update node topic
jsmind.update_node('node1', 'new topic of node1');
//
```

在上面的 V1 版本中，几乎所有的 API 都由 jsMind 对象承担。在 V2 版本中，API 设想如下：

```javascript
// initialize an arranger for mindmap style
const arranger = new MindmapArranger();

// initialize a mindmap object
const mindmap = new Mindmap();

// initialize a jsmind application with the arranger
const jsMindApp = new jsMind(arranger);

// application open a mindmap object
jsMindApp.open(mindmap);

// create new node under root node
const node1 = mindmap.addChildNode(mindmap.rootId, 'topic of node1');

// update node topic
node1.topic = 'new topic of node1'
```

V2 版本将 jsMind application, arranger 和 mindmap 数据对象三个概念分离：
- jsMind : 代表了一个 application，它用于组装不同的组件；
- arranger : 这是一个节点摆放计算器，MindmapArranger 会按 mindmap 的样式计算出每个节点的位置；
- mindmap : 这是脑图数据，存储了脑图数据，包括节点的数据；（节点的数据状态存储在节点对象里）

从程序结构上来说，V1 更“面向过程”，而 V2 更“面向对象”。V1 中 jsMind 包含所有状态，而 V2 中不同对象各自管理其状态。

模块
===

Arranger 是一类模块，除了 Mindmap Arranger 外，还可以实现出 Organization Arranger， Freestyle Arranger 等，它们仅负责计算节点位置。

另一类是 view 模块，负责绘制节点和连线。绘制节点时，可以考虑与 React/Vue 等框架集成；绘制连线时，可以选择使用 Canvas 或 SVG 等技术。

数据模块（mindmap）仅用于管理节点的数据和逻辑关系。

除 mindmap 模块作为基础数据层被其他模块引用外，其他模块彼此独立，互不感知。例如，arranger 仅根据 mindmap 计算节点坐标，而不知 view 如何使用这些坐标；view 模块计算节点尺寸，却不知 arranger 需要这些数据。

交互
===

上面的示例代码显示，修改节点文本只需更新 node.topic 属性。在 jsMind 内部，数据变化要反映在脑图上，需要一定的交互设计。

数据层位于架构底层，被其他模块引用。数据变化时，需通知 arranger 和 view 更新视图。

用户通过 UI 更新节点或脑图时，jsMind 将会先更新 mindmap 数据，再通知其他模块更新视图。

![modules](/blog/jsmind/images/2025/jsmind-v2-modules.png)
