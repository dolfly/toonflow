---
title: "02 · Tools 工具插件开发"
---

一个工具插件可以提供多个 Agent 工具，并可为工具消息附带 Vue 界面。工具由 Bun 动态加载，源码可使用 Bun、Node 内置模块和已声明依赖。插件标识与实际工具调用名是两个概念：下面插件为 echoTool，调用名为 echoText。

## 1. 创建最小工具

新建 packages/tools/echoTool/，包含 package.json、tsconfig.json、build.ts、src/index.ts；可选 readme.md 在构建时嵌入插件说明。

**package.json**

```json
{
  "name": "@toonflow/tool-echo",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "bun build.ts",
    "typecheck": "tsc"
  },
  "dependencies": { "zod": "^4.6.2" },
  "devDependencies": { "@toonflow/tools-scaffold": "workspace:*" }
}
```

**tsconfig.json**

```json
{
  "extends": "../../../tsconfig.base.json",
  "include": ["build.ts", "src"]
}
```

**build.ts**

```typescript
import { createToolConfig } from "@toonflow/tools-scaffold";

await createToolConfig({
  name: "echoTool",
  displayName: "文本回声",
  description: "给输入文本添加前缀并返回结果。",
  author: "示例作者",
  github: "",
  prompt: "用户需要测试工具调用或明确要求返回带前缀的文本时，使用 echoText。",
  configRules: [{
    type: "input",
    field: "prefix",
    title: "文本前缀",
    value: "回声：",
    props: { maxlength: 100 },
  }],
}, import.meta.url);
```

**src/index.ts**

```typescript
import { z } from "zod";
import type { ToolDefinition, ToolPlugin } from "@toonflow/tools-scaffold/runtime";

const configSchema = z.object({
  prefix: z.string().max(100).default("回声："),
}).strict();

const inputSchema = z.object({
  text: z.string().min(1).max(2000).describe("需要添加前缀的文本"),
}).strict();

const plugin: ToolPlugin = {
  validateConfig(config) {
    return configSchema.parse(config);
  },
  createTools(context) {
    const config = configSchema.parse(context.config);
    const tool: ToolDefinition = {
      name: "echoText",
      label: "文本回声",
      description: "在输入文本前添加用户配置的前缀，返回完整文本。",
      promptSnippet: "给文本添加已配置的前缀。",
      parameters: z.toJSONSchema(inputSchema, { io: "input", target: "draft-07" }),
      async execute(toolCallId, params, signal) {
        signal?.throwIfAborted();
        const { text } = inputSchema.parse(params);
        const result = config.prefix + text;
        return {
          content: [{ type: "text", text: result }],
          details: { text: result },
        };
      },
    };
    return [tool];
  },
};

export default plugin;
```

在仓库根目录执行：

```bash
bun install
bun run --cwd packages/tools/echoTool typecheck
bun run --cwd packages/tools/echoTool build
```

产物为 build/tools/echoTool.tool.js。安装并启用后，在选择工作区的 Agent 对话中要求“调用 echoText，输入 hello”，应返回“回声：hello”。修改配置前缀后，再发一条消息验证。

## 2. 插件与工具契约

| **接口** | **职责** |
|-|-|
| validateConfig(config) | 同步校验并返回规范化配置；保存和加载时调用，失败抛错。 |
| createTools(context) | 返回 ToolDefinition[] 或其 Promise；可返回空数组，表示本轮不提供能力。 |

| **ToolDefinition 字段** | **说明** |
|-|-|
| name | 实际调用名，使用小驼峰；同一轮所有插件之间必须唯一。 |
| label / description | 界面名称及供模型理解的用途、输入和限制。 |
| parameters | JSON Schema，通常由 z.toJSONSchema 生成。 |
| execute | 异步执行，返回 content 与 details；文本 content 为 { type: "text", text }。 |
| promptSnippet | 系统提示中的简短用途摘要。 |
| promptGuidelines | 运行时规则字符串数组。 |
| executionMode | 可选 sequential 或 parallel。 |

执行签名为 execute(toolCallId, params, signal, onUpdate, ctx)。onUpdate 可上报中间结果；最后的 ctx 是 Pi 执行上下文，与 createTools(context) 的 Toonflow 上下文不同。

parameters 不替代执行时校验。execute 中仍用 Zod parse 校验输入，将 signal 传给支持取消的请求，长任务在阶段边界检查取消。失败时抛出明确错误。

build.ts 的 prompt 用于插件共享静态规则，promptSnippet 用于单个工具摘要，promptGuidelines 用于动态约束。宿主只汇总本轮实际加载工具的规则并去重。

## 3. 构建元数据与配置

| **字段** | **规则** |
|-|-|
| name | 必填小驼峰，最长 96 字符。 |
| displayName | 去除首尾空白后 1–100 字符。 |
| description | 必填字符串，最多 2000 字符。 |
| author / github | 必填字符串，可为空；GitHub 链接须为无账号密码的 [https://github.com](https://github.com) 地址。 |
| prompt | 可选，最多 20000 字符。 |
| configRules | 必填纯 JSON 数组，最多 100 项，无配置传 []。 |
| components | 可选，“实际工具名 → Vue 源文件路径”映射。 |

version 自动读取 package.json，readme 自动读取子包 readme.md，无需再次写入构建参数。

configRules 使用 FormCreate 规则：field 对应 context.config 属性，value 为默认值，选项放 options，组件属性放 props。例如密码输入可使用 props: { type: "password", showPassword: true }。

宿主提取顶层规则的 field/value 默认值，以已保存配置覆盖，再调用 validateConfig。配置保存于 toolConfigs.<插件名>。规则不得包含函数或回调；前端表单校验不能替代服务端校验。API Key 由用户填写，不写入源码或返回给模型。

## 4. 宿主上下文

| **API** | **用途与边界** |
|-|-|
| cwd | 本次绑定的工作区绝对路径。 |
| config | 仅当前插件已校验配置，不是全局设置。 |
| resolvePath(path, readOnly?) | 检查工作区边界和符号链接后返回绝对路径；readOnly=true 还允许读取全局技能目录。 |
| writeFile(path, content) | 带锁的原子文本写入；输出父目录应先存在。 |
| sdk | 注入 defineTool、createReadToolDefinition、createWriteToolDefinition、createEditToolDefinition、createLsToolDefinition、detectSupportedImageMimeTypeFromFile。 |
| ffmpeg(signal?) | 获取绑定工作区的原生 FFmpeg 工厂。 |
| media? | listModels、generateImage、generateVideo、generateAudio。 |
| canvas? | 当前画布 id、节点工具 tools、call(request, signal?) 和可选 getNodeLabel。 |
| question? | ask(toolCallId, request, signal?)，等待用户作答或跳过；需要配套交互组件。 |
| skills? | list、read、create、update；请求使用 name、scope?、path?，写入提供 content。 |

可选能力先判断是否存在，缺少所需上下文时可以返回 []。复用 SDK 文件工具时，通过 operations 接入宿主 resolvePath/writeFile，参考 packages/tools/workspace/src/index.ts，不把整套 Pi SDK 打入插件。

媒体请求使用 providerId、modelId、prompt，其余字段见 packages/toolScaffold/src/runtime.ts；结果数组提供工作区资源 path、mimeType、mediaType。

## 5. FFmpeg

context.ffmpeg() 返回原生 @renmu/fluent-ffmpeg 工厂，支持链式调用、事件、流、run/save/pipe/clone 和 ffprobe 回调。以下片段用于 execute 内，输入和输出父目录应已存在：

```typescript
const ffmpeg = await context.ffmpeg();
await new Promise<void>((resolve, reject) => {
  ffmpeg("assets/input.mp4")
    .videoCodec("libx264")
    .on("error", reject)
    .on("end", () => resolve())
    .save("assets/output.mp4");
});
```

路径必须位于工作区。原始参数、复杂滤镜与媒体清单的间接 I/O 不做完整解析，可信工具接口不是文件系统沙箱。处理用户素材时使用新输出文件名。

> **取消边界：**context.ffmpeg(signal) 只覆盖获取工厂的准备阶段。启动后由调用方监听取消并 command.kill("SIGKILL")，处理启动前取消并清理监听器。缺少 FFmpeg/FFprobe 时抛出 FFMPEG_REQUIRED（HTTP 424），用户安装或配置后重试，不会自动安装或重跑。

## 6. 可选消息界面

在 build.ts 添加 components: { echoText: "src/resultCard.vue" }，键是实际工具名。组件示例：

```text
<template>
  <div class="resultCard">
    <span>{{ tool.status }}</span>
    <pre v-if="tool.result">{{ tool.result }}</pre>
  </div>
</template>

<script setup lang="ts">
import type { ToolCall } from "@toonflow/tools-scaffold/runtime";

defineProps<{ tool: ToolCall; directory?: string }>();
</script>
```

子包声明所用 Vue/UI 依赖；组件显式导入 UI 组件，不能依赖主应用自动导入。构建器将界面与 CSS 嵌入同一个 .tool.js；Vue、Element Plus、Axios、form-create 复用 toonflowToolHost 实例。

宿主传入 tool 与可选 directory。tool 包括 id、name、args?、result?、question?、status；状态为 running、success、error、interrupted。历史消息可能没有实时 question，界面应兼容。提问交互参考 packages/tools/askUser，不要遗漏作答界面。

## 7. 构建与常见问题

普通单包 build 只写 build/tools。仅 NODE_ENV=dev 时同步 data/tools。PowerShell 中可按下面方式单包同步并恢复环境变量：

```powershell
$previousNodeEnv = $env:NODE_ENV
try {
  $env:NODE_ENV = "dev"
  bun run --cwd packages/tools/echoTool build
} finally {
  $env:NODE_ENV = $previousNodeEnv
}
```

bun run build:tools 清理 build/tools 后构建全部工具，不修改安装目录。产物首行 toonflowTool 元数据、可选第二行 toonflowToolClient 由脚手架生成，不能删除或重排。

安装器会清除 Bun 对该模块的缓存；直接复制覆盖 data/tools 不经过缓存清理，仍执行旧代码时重启 Server 或通过安装入口重装。配置和启停用于后续加载，不替换执行中的函数。

精确的 import { z } from "zod" 构建时映射为宿主 toonflow:tool-zod；产物应通过兼容宿主加载。普通依赖随构建打包，但原生模块、动态资源和外部文件仍需验证分发完整性。

| **现象** | **检查方向** |
|-|-|
| 构建后没有变化 | 是否只更新 build，是否同步/安装，模块是否仍有缓存。 |
| 元数据或导出错误 | 文件名与 name 是否一致；默认导出是否有 validateConfig/createTools。 |
| 工具名称重复 | 调整 ToolDefinition.name，同步组件映射和提示词。 |
| 启用后不可用 | 配置是否有效，createTools 是否因上下文缺失返回 []。 |
| 界面加载失败 | 检查组件映射、客户端依赖与历史消息兼容。 |

参考源码：packages/toolScaffold/index.ts、packages/toolScaffold/src/runtime.ts、apps/server/src/utils/plugins/tools.ts、apps/server/src/agent/tools/index.ts。
