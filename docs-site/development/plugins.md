# 插件、技能与提供方

## 通过网页唤起桌面安装插件

安装桌面客户端后，网页可通过 `toonflow://install` 请求安装插件。应用会先展示类型、文件名和下载地址，用户确认后再下载与安装。

```ts
const link = new URL('toonflow://install')
link.searchParams.set('type', 'node')
link.searchParams.set('url', 'https://example.com/plugins/exampleNode.umd.js')
window.location.href = link.href
```

| `type` | 文件格式 | 安装位置 |
| --- | --- | --- |
| `node` | `.umd.js` | `data/nodes/` |
| `tool` | `.tool.js` | `data/tools/` |
| `skill` | `SKILL.md`、`.zip`、`.tar`、`.tar.gz`、`.tgz` | `data/skills/<name>/` |
| `provider` | 媒体提供方 `.ts` | `data/providers/` |

下载地址须为 HTTP/HTTPS，文件名来自 URL 路径。同名节点、工具和技能在版本更高时允许更新；覆盖同版本或降级需在开发者选项中使用强制安装，提供方不覆盖同名项。

普通插件与技能包最多 20 MB，技能解压后也受此限制；提供方最多 2 MB。技能包支持 ZIP 和 TAR，须包含带有 `name`、`description` frontmatter 的 `SKILL.md`，附属资源放在其所在目录内。TAR 包使用普通 USTAR 格式，不包含链接及 PAX/GNU 扩展条目。

Windows 安装器负责注册协议；macOS 需要将应用放入 `/Applications` 或 `~/Applications`。普通浏览器开发模式不注册桌面协议。

## 插件开发工具

插件开发工具位于 `packages/tools/pluginDeveloper`，作为工作区子包随默认工具构建和内置，产物为 `build/tools/pluginDeveloper.tool.js`，开发构建同步到 `data/tools/`。SDK 下载、缓存和插件构建由工具负责，主程序只提供本机权限校验及安装、刷新、上传桥接。工具私有资源在卸载时一并清理。

安装后可在插件市场或助手中调用，用于创建骨架、本地构建、上传与刷新插件。

## 各扩展类型的入口

| 扩展类型 | 脚手架 / 实现 | 说明 |
| --- | --- | --- |
| 节点 | [packages/nodeScaffold](https://github.com/dolfly/toonflow/blob/master/packages/nodeScaffold/readme.md) | 画布交互组件、端口与节点操作。 |
| 工具 | [packages/toolScaffold](https://github.com/dolfly/toonflow/blob/master/packages/toolScaffold/readme.md) | Agent 可调用的能力，可带交互 UI。 |
| 技能 | [packages/skills](https://github.com/dolfly/toonflow/tree/master/packages/skills) | `SKILL.md` 描述的创作流程与方法。 |
| 提供方 | [packages/providers/src](https://github.com/dolfly/toonflow/tree/master/packages/providers/src) | 模型列表、请求参数与媒体返回结果适配。 |

节点与工具的配置表单统一使用 `@form-create/element-ui` 的规则；有必填项未填写时，配置按钮会显示红点。工具只接收自身配置，宿主不向工具直接传递完整应用设置。

媒体接口包含图片、视频和音频的扩展类型，实际能力由各提供方实现。技能既可以全局安装，也可以放在当前工作区的 `skill/` 目录，同名时优先使用工作区版本。

## MCP 接入

需要从外部 Coding 工具操作 Toonflow 时，在“设置 → MCP”开启服务并复制客户端配置，支持 HTTP 与 stdio 连接。画布和节点等界面操作需要保持 Toonflow 窗口或网页打开。

完整说明见 [packages/mcp/README.md](https://github.com/dolfly/toonflow/blob/master/packages/mcp/README.md)。
