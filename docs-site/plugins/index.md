---
title: 插件开发
---

# 插件开发

**DEVELOPER GUIDE**　工具 · 画布节点 · 技能

本文面向 Toonflow 插件开发者，介绍 tools、nodes、skill 的开发契约、最小示例、构建与安装流程。**teams 当前处于测试阶段，尚未开放。**

示例依据当前仓库实现，在 Toonflow 的 Bun Workspaces 中开发。脚手架使用 `workspace:*` 引用；版本与依赖应跟随所开发的 Toonflow 版本。

> **阅读路线**　首次开发先读「01 开发总览」，再按扩展类型进入 Tools、Nodes 或 Skill；完成后对照「06 交付前检查」。
>
> **开放状态**　Tools / Nodes / Skill 可开发；A2A Teams 暂未开放。

## 章节

| 章节 | 你要解决的问题 | 一句话结论 |
| --- | --- | --- |
| [01 · 开发总览](./overview.md) | 该做 tool、node 还是 skill？环境怎么搭、怎么装怎么调？ | 先选题再动手；`dev:plugins` 同步到 `data/`，构建与类型检查分开跑。 |
| [02 · Tools 工具插件开发](./tools.md) | 给 Agent 增加搜索、文件、媒体等可调用能力。 | Bun 服务端执行，产物 `<toolName>.tool.js`，可带 Vue 消息组件。 |
| [03 · Nodes 节点插件开发](./nodes.md) | 给画布增加交互组件、端口与节点操作。 | Vue 3 包，`defineOptions` 声明端口，`useNode` 取状态，产物 `<nodeName>.umd.js`。 |
| [04 · Skill 技能插件开发](./skill.md) | 约定流程、方法、输出要求与参考资料。 | 只有 `SKILL.md` 与附属资料，不编译、不新增执行权限。 |
| [05 · A2A Teams 团队插件](./teams.md) | 组织多 Agent 职责与协作。 | **测试阶段，尚未开放**，仅说明状态。 |
| [06 · 交付前检查](./checklist.md) | 发布前要自查什么。 | 名称/导出/版本一致，从最终分发文件安装验证。 |
| [07 · 发布插件](./publish.md) | 把插件交给用户。 | 直接上传到 Toonflow 插件市场，不需要向仓库提 PR。 |

::: tip 和「插件市场」页面的关系
站点另一处[插件市场](/guide/plugin-market)讲的是**用户怎么装插件**；「插件、技能与提供方」[开发文档页面](/development/plugins)讲的是**安装契约与 `toonflow://install` 协议**。本分组是从零写一个插件到发布的全流程开发指南。
:::
