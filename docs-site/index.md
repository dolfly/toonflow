---
layout: home

hero:
  name: Toonflow
  text: 开源 AI 短剧、漫剧与视频创作平台
  tagline: 把剧本、角色、场景与视频片段整合进同一张无限画布，本地部署、自由接入模型，用 Agent 串起从小说到成片的完整流程。
  image:
    src: /logo.png
    alt: Toonflow
  actions:
    - theme: brand
      text: 新手入门
      link: /guide/
    - theme: alt
      text: 下载与安装
      link: /guide/install
    - theme: alt
      text: 开发文档
      link: /development/
    - theme: alt
      text: 插件开发
      link: /plugins/
    - theme: alt
      text: 部署运维
      link: /deploy/

features:
  - title: 无限画布
    details: 在同一张画布中组织剧本、角色、场景与视频片段，节点连线即可复现整套创作流程。
  - title: 自由接入模型
    details: 配置第三方文本、图片、视频模型服务，也可接入本地 ComfyUI 与本地 LLM，不强制绑定渠道。
  - title: 本地部署
    details: 项目与素材保存在自己的设备或服务器，支持桌面端、Android、Docker 与服务器部署。
  - title: 插件市场
    details: 通过插件市场扩展节点、工具、技能与模型提供方，创作能力不必等官方更新。
  - title: 开放 Agent
    details: 开放提示词、工具与 A2A 协作，可自定义 Agent 行为，用自然语言驱动画布操作与素材生成。
  - title: 多语言支持
    details: 界面支持 21 种语言，文档、技能与提示词可随工作区独立维护。
---

## 亮点

| 能力 | 说明 |
| --- | --- |
| 🏠 **本地部署** | 项目与素材保存在自己的设备或服务器，支持桌面、Android、Docker 与服务器部署。 |
| 🖼️ **无限画布** | 在同一画布中组织剧本、角色、场景与视频片段。 |
| 🔌 **MCP** | 通过 MCP 连接外部工具与服务，详见 [MCP 接入说明](https://github.com/dolfly/toonflow/blob/master/packages/mcp/README.md)。 |
| 🧩 **插件市场** | 通过[插件市场](https://api.toonflow.net/console/plugIn)扩展节点、工具与创作能力。 |
| 🤖 **开放 Agent** | 开放提示词、工具和 A2A，支持自定义 Agent 行为及外部协作。 |
| 🔧 **自由接入模型** | 配置第三方 API，也可接入本地 ComfyUI 和 LLM。 |
| 🌐 **多语言支持** | 支持 21 种界面语言。 |

### 如何用 Toonflow 制作 AI 短剧与漫剧

1. **编写剧本与分镜**：在文本节点中整理故事、人物设定和镜头描述，使用语言模型辅助创作，再审阅与修改内容。
2. **准备角色与场景素材**：导入参考图片，或通过图片生成节点制作角色、场景和分镜图。
3. **生成视频镜头**：连接文本与图片参考，选择视频模型和生成模式，按镜头生成视频片段。
4. **预览、整理与下载**：在无限画布中预览和组织图片、视频片段，下载素材后按创作需求继续处理。

支持的参考素材、视频时长、分辨率和音频能力取决于所选模型与供应商。

## 文档导航

| 分组 | 内容 |
| --- | --- |
| [使用教程](/guide/) | 首次配置模型、无限画布与节点、素材库、3D 导演台、视频合成、插件市场与 Agent 助手。 |
| [开发文档](/development/) | 技术栈与目录、本地开发与构建、插件/技能/提供方扩展、多语言维护、桌面打包。 |
| [部署运维](/deploy/) | 服务端与 Docker 部署、访问与数据、版本发布流水线、客户端增量更新。 |

## 截图

<p align="center">
  <img src="../docs/images/screenshots/projectHome.png" alt="Toonflow 项目首页与灵感创作" width="80%" />
  <br /><sub>项目首页与灵感创作</sub>
</p>

<p align="center">
  <img src="../docs/images/screenshots/canvasDark.png" alt="Toonflow 深色主题画布与 AI 助手" width="80%" />
  <br /><sub>创作画布 · 深色主题</sub>
</p>

<p align="center">
  <img src="../docs/images/screenshots/directorStudio.png" alt="Toonflow 3D 导演台与镜头预演" width="80%" />
  <br /><sub>3D 导演台与镜头预演</sub>
</p>

<p align="center">
  <img src="../docs/images/screenshots/videoGeneration.png" alt="Toonflow 多参考素材视频生成" width="80%" />
  <br /><sub>多参考素材视频生成</sub>
</p>

<p align="center">
  <img src="../docs/images/screenshots/pluginMarket.png" alt="Toonflow 插件市场" width="80%" />
  <br /><sub>插件市场</sub>
</p>

## 常见问题

**Toonflow 可以用于哪些 AI 短剧和漫剧制作环节？**

Toonflow 提供文本、图片与视频生成节点，可用于剧本与分镜创作、角色和场景素材制作、视频镜头生成，以及素材的预览与整理。创作者需要审阅和调整内容，具体生成能力取决于配置的模型。

**Toonflow 免费吗？模型调用需要付费吗？**

Toonflow 采用 MIT 开源许可，可自行部署。第三方模型服务的 API 调用可能收费；使用本地模型或 ComfyUI 时，需要自行准备相应的运行环境与算力。作品示例中的制作费用仅代表该案例，不是固定价格。

**可以接入自己的模型和 ComfyUI 工作流吗？**

可以配置语言模型与媒体模型服务，也可通过自定义供应商适配接入已有的 ComfyUI 工作流。具体接入方式取决于服务 API、模型与工作流，可参考[使用教程](/guide/)与[开发文档](/development/plugins)。

## 参与与许可

- 源码仓库：[dolfly/toonflow](https://github.com/dolfly/toonflow)（上游：[HBAI-Ltd/Toonflow-app](https://github.com/HBAI-Ltd/Toonflow-app)）
- 问题反馈：[Issues](https://github.com/dolfly/toonflow/issues)
- 社区：[Discord](https://discord.gg/HEjKmpNpAZ) · 微信交流群见仓库 README
- 许可证：[MIT](https://github.com/dolfly/toonflow/blob/master/LICENSE)

> **不追溯条款**：v1.0.8 发布前基于 AGPL-3.0 使用的用户，继续按 AGPL-3.0 执行，v1.0.8 ~ v1.1.8 继续按 Apache-2.0 与附加协议执行，不受本协议变更约束。
