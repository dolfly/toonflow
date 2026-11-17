---
title: "01 · 开发总览"
---

## 1. 选择扩展类型

| **类型** | **适用场景** | **运行方式与交付物** |
|-|-|-|
| tools | 为 Agent 增加搜索、文件操作、网络请求、媒体处理等可调用能力。 | Bun 服务端执行；分发 `<name>`.tool.js，可附带 Vue 消息组件。 |
| nodes | 增加画布交互组件、输入输出端口和节点操作。 | 浏览器或桌面 WebView 执行；分发 `<name>`.umd.js。 |
| skill | 约定任务流程、专业方法、输出要求与参考资料。 | 按需读取 SKILL.md 和资源，无需编译。 |
| teams | 组织多 Agent 的职责和协作。 | 未开放，见本文第五章。 |

需要可执行操作时开发 tools，需要画布界面时开发 nodes，已有操作能力足够、只需明确流程时开发 skill。三类扩展可配合使用。

## 2. 开发环境与目录

使用根目录 package.json 指定的 Bun 版本。以下命令在仓库根目录运行：

```bash
bun install
bun run dev:plugins
bun run dev
```

dev:plugins 构建工具和节点，并同步到开发用 data/。dev 启动 Web 与 Server，不会自动重新构建插件。开发页面默认为 `http://localhost:5173`，Server 默认监听 `3000`。

```text
packages/
  toolScaffold/        工具构建器与运行时类型
  nodeScaffold/        节点构建器与运行时接口
  tools/<toolName>/    工具源码
  nodes/<nodeName>/    节点源码
  skills/<skillName>/  SKILL.md 与附属资源
build/
  tools/              <toolName>.tool.js
  nodes/              <nodeName>.umd.js
  skills/             内置技能副本
data/
  tools/              已安装工具
  nodes/              已安装节点
  skills/             已安装全局技能
  settings.json       设置与插件配置
```

build/ 是构建产物，data/ 是运行时安装目录。生产数据位置由宿主决定，不要假定是终端当前目录。工作区局部技能放在当前项目的 skill/，注意这里是单数。

## 3. 命名与版本

- 插件标识、源码目录、自有函数、变量和组件使用小驼峰，例如 echoTool、noteNode、storyReview。Vue 文件按 template → script → style 排列。
- 工具文件名为 `<toolName>`.tool.js，节点文件名为 `<nodeName>`.umd.js，必须与构建标识一致；不要在文件名中追加版本。
- SKILL.md 是协议固定名称，保留大写。
- tools、nodes 的版本来自插件 package.json.version；skill 的版本来自 frontmatter 的 metadata.version。
- 使用完整 SemVer，例如 1.0.0、1.1.0-beta.1。正常覆盖安装要求新版本高于旧版本。

## 4. 安装、更新与调试

1. 构建产物，或准备 Skill 主文件与资源包。
2. 打开“设置 → 插件市场 → 已安装 → 安装插件”。
3. 检查插件名称、版本与加载错误；有配置时填写并保存，工具和节点需处于启用状态。
4. 执行一次实际操作，检查输出、失败反馈与取消行为。

同版本反复调试、降级或旧版本无有效版本号时，在“设置 → 开发者选项 → 手动安装插件”勾选“强制安装（允许覆盖同版本或降级）”。强制安装仍会校验格式。

安装管理要求从桌面端或 Server 本机发起。开发者选项支持本地文件和 HTTP/HTTPS 文件直链；直链不能包含 URL 用户名密码，也不能返回登录页或 HTML 预览页。下载最多等待 30 秒，最多跟随 5 次重定向。

| **类型** | **安装格式** | **限制** |
|-|-|-|
| tools | .tool.js | 非空，最多 20 MiB，保留构建元数据和默认导出。 |
| nodes | .umd.js | 非空，最多 20 MiB，导出名必须匹配文件名。 |
| skill | .md、.zip、.tar、.tar.gz、.tgz | 包及解包总量最多 20 MiB；恰好一个 SKILL.md。 |

桌面客户端也支持网页唤起安装，应用会展示信息并要求用户确认：

```typescript
const installUrl = new URL("toonflow://install");
installUrl.searchParams.set("type", "tool");
installUrl.searchParams.set("url", "https://example.com/plugins/echoTool.tool.js");
window.location.href = installUrl.href;
```

本文开放类型使用 tool、node、skill。普通浏览器开发模式不注册桌面协议。

## 5. 运行边界

工具拥有 Server 进程权限；节点在宿主页面执行。优先复用宿主文件、模型、画布与 FFmpeg 能力，不打包真实密钥或本机数据。界面交互和画布操作需要对应页面保持连接。

配置表单统一使用 @form-create/element-ui 的 JSON 规则。工具配置在 context.config；节点配置在 useNode().config。分别保存于 settings.json 的 toolConfigs 与 nodeConfigs。当前 FFmpeg 使用 ffmpeg(signal?) 工厂接口，具体边界见后文。
