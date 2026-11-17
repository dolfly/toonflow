# 开发与扩展概览

本文收录插件开发、源码运行、桌面打包和更新发布的详细说明。首次参与开发，可先阅读[贡献指南](https://github.com/dolfly/toonflow/blob/master/CONTRIBUTING.md)。

- [本地开发与构建](./setup.md)
- [插件、技能与提供方](./plugins.md)
- [多语言维护](./i18n.md)
- [桌面构建与打包](./desktop.md)
- [项目结构](./structure.md)
- [部署运维](/deploy/)

## 插件与模型扩展

通过“设置 → 插件市场”发现和管理节点、工具与技能；市场顶部可以直接打开[网页版市场](https://api.toonflow.net/console/plugIn)，开发指南见本站[插件开发](/plugins/) 分区。市场使用“账号与余额”中登录的 Toonflow 账号。

| 扩展类型 | 用途 | 开发入口 |
| --- | --- | --- |
| 节点 | 为画布增加交互组件、输入输出端口与节点操作。 | [节点脚手架](https://github.com/dolfly/toonflow/blob/master/packages/nodeScaffold/readme.md) · [内置节点](https://github.com/dolfly/toonflow/tree/master/packages/nodes) |
| 工具 | 为 Agent 增加工作区操作、搜索、媒体生成等能力，可附带交互 UI。 | [工具脚手架](https://github.com/dolfly/toonflow/blob/master/packages/toolScaffold/readme.md) · [内置工具](https://github.com/dolfly/toonflow/tree/master/packages/tools) |
| 技能 | 用 `SKILL.md` 和附属资料描述创作流程、方法与操作约定。 | [内置技能](https://github.com/dolfly/toonflow/tree/master/packages/skills) |
| 提供方 | 适配不同平台的模型列表、请求参数和媒体返回结果。 | [提供方实现](https://github.com/dolfly/toonflow/tree/master/packages/providers/src) |

节点与工具的配置表单统一使用 `@form-create/element-ui` 的规则；有必填项未填写时，配置按钮会显示红点。工具只接收自身配置，宿主不向工具直接传递完整应用设置。

媒体接口包含图片、视频和音频的扩展类型，实际能力由各提供方实现。技能既可以全局安装，也可以放在当前工作区的 `skill/` 目录，同名时优先使用工作区版本。

需要从外部 Coding 工具操作 Toonflow 时，在“设置 → MCP”开启服务并复制客户端配置，支持 HTTP 与 stdio 连接。画布和节点等界面操作需要保持 Toonflow 窗口或网页打开，详见 [MCP 接入说明](https://github.com/dolfly/toonflow/blob/master/packages/mcp/README.md)。

## 技术栈

前端、业务服务和桌面端在同一个 Bun Workspaces 仓库中维护。

| 层级 | 技术 |
| --- | --- |
| 运行时与包管理 | Bun 1.4.3、Bun Workspaces |
| 前端 | Vue 3、Vite、TypeScript、Pinia、Element Plus、Vue Flow |
| 服务端 | Bun、Express 5、Zod |
| Agent | Pi Agent SDK、工具插件、Markdown 技能与记忆 |
| 桌面 | Electrobun；Windows 使用 WebView2 和 NSIS 安装器 |
| 3D 与媒体 | Three.js、FFmpeg、可扩展的媒体提供方 |

## 文档站自身的构建

本站基于 VitePress，源码位于仓库的 `docs-site/` 目录，图片复用 `docs/images/`：

```sh
cd docs-site
bun install
bun run dev     # 本地预览 http://localhost:5173
bun run build   # 生成 docs-site/.vitepress/dist
```

推送到 `master`（或手动触发）时，GitHub Actions 会重新构建并发布到 GitHub Pages，流程见[版本发布与 CI](/deploy/release)。
