---
title: "03 · Nodes 节点插件开发"
---

节点是 Vue 3 + TypeScript 工作区包。createNodeConfig 定义构建元数据，defineOptions 声明组件与端口，useNode 取得实例状态。浏览器运行时代码统一从 @toonflow/nodes-scaffold/runtime 导入；包根入口只用于构建配置。

## 1. 创建最小节点

新建 packages/nodes/noteNode/，包含 package.json、tsconfig.json、vite.config.ts、readme.md、src/index.vue。根 workspace 已包含 packages/nodes/\*，无需手工注册主应用。

**package.json**

```json
{
  "name": "@toonflow/node-note",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "typecheck": "vue-tsc --noEmit"
  },
  "peerDependencies": {
    "vue": "^3.5.42",
    "@vue-flow/core": "^1.48.2",
    "element-plus": "^2.14.5"
  },
  "devDependencies": {
    "@toonflow/nodes-scaffold": "workspace:*",
    "typescript": "~6.0.3",
    "vite": "^8.2.2",
    "vue-tsc": "^3.3.11"
  }
}
```

**tsconfig.json**

```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

**vite.config.ts**

```typescript
import { createNodeConfig } from "@toonflow/nodes-scaffold";

export default createNodeConfig({
  name: "noteNode",
  displayName: "便签",
  author: "你的名字",
  github: "",
}, import.meta.url);
```

readme.md 写入插件用途与用法，例如“在画布中编辑短文本，通过 text 端口向其他节点提供文本”。

**src/index.vue**

```text
<template>
  <nodeSkeleton v-bind="nodeProps">
    <textarea
      v-model="outputs.text.value"
      class="noteEditor nodrag nopan nowheel"
      aria-label="便签文本"
      @pointerdown.stop
      @mousedown.stop
      @dblclick.stop
      @keydown.stop />
  </nodeSkeleton>
</template>

<script setup lang="ts">
import { nodeSkeleton, useNode, type NodeHandle } from "@toonflow/nodes-scaffold/runtime";

defineOptions({
  inheritAttrs: false,
  handles: [
    { id: "text", type: "source", dataType: "STRING", label: "文本输出" },
  ] satisfies NodeHandle[],
});

const { nodeProps, outputs } = useNode({
  label: "便签",
  outputs: { text: { dataType: "STRING", value: "" } },
});
</script>

<style scoped>
.noteEditor {
  box-sizing: border-box;
  width: 280px;
  min-height: 120px;
  resize: vertical;
}
</style>
```

nodeSkeleton 将端口与输出同步到 node.data，由画布保存流程持久化；重新打开后 useNode 恢复匹配的输出。短文本可直接存画布 JSON；长正文或媒体使用工作区文件。

inheritAttrs: false 避免 Vue Flow 属性覆盖骨架参数。nodrag、nopan、nowheel 是 Vue Flow 约定交互类名，配合事件阻止冒泡，避免编辑时触发画布拖动或快捷键。

## 2. 开发与安装

```bash
bun install
bun run --filter '@toonflow/node-note' typecheck
bun run --filter '@toonflow/node-note' dev
```

保持监听进程运行，另一终端执行 bun run dev，打开画布后从添加节点菜单选择“便签”。新建 workspace 后重新 bun install，建立依赖链接。

| **命令** | **行为** |
|-|-|
| 单包 dev | 监听构建，生成 build/nodes/noteNode.umd.js 并同步 data/nodes。 |
| 单包 build | 默认只生成 build；NODE_ENV=dev、Vite development 或 watch 时同步。 |
| bun run dev:plugins | 构建所有 tools/nodes，并同步开发目录。 |
| bun run build:nodes | 清理 build/nodes 后构建全部节点，不更新 data。 |

构建完成后点击节点标题栏刷新，或刷新宿主页面。watch 是构建监听，不是独立网页服务器；刷新前宿主会通知同类型实例保存。开发同步不会清除禁用标记。

分发原始 .umd.js，保留元数据与 toonflowNodes.`<name>` 导出。宿主从 /api/nodes/get 读取列表，从 /api/nodes/files?name=noteNode 获取脚本，注册画布类型 remote-noteNode。

当前 UMD 会注入组件样式，安装和加载以单 JS 文件为单位。不要假定独立字体、图片或动态资源文件会自动随插件安装；发布前检查产物的资源引用。

## 3. 元数据与配置

| **createNodeConfig 字段** | **说明** |
|-|-|
| name | 唯一小驼峰标识，决定文件名与导出名。 |
| displayName | 非空显示名称。 |
| author / github | 可为空；非空 GitHub 链接须为 [https://github.com](https://github.com)。 |
| configRules? | 最多 100 项 FormCreate JSON 规则。 |

版本来自 package.json.version，说明来自 readme.md，写入首行 toonflowNode 元数据。配置在 useNode().config 中读取，脚本使用 config.value.`<field>`，只读且响应式。同类型实例共用配置，默认值取规则 value，不写入画布 JSON。

必填字段可用 validate: [{ required: true, message: "请填写" }]。配置会提供给浏览器节点，不应当作只在服务器可见的秘密存储。

## 4. 状态与端口

useNode(options?) 必须在 setup 中调用，选项支持 label、icon、handles、outputs。图标和默认端口通常放 defineOptions，供创建节点前菜单与连线筛选使用。

| **返回成员** | **用途** |
|-|-|
| id / node | 节点 ID 与 Vue Flow 节点；业务状态可写入可序列化的 node.data。 |
| nodeProps | 传入 nodeSkeleton 的计算属性。 |
| handles / outputs | 可修改 ref，脚本使用 .value，模板自动解包。 |
| config | 同类型节点的只读配置。 |
| nodeEvent / nodeTools | 节点事件和对 Agent 暴露的操作。 |
| files / ai / ffmpeg | 工作区文件、模型与媒体处理。 |
| previewReady / updateNodeInternals() | 预览挂载状态与端口位置重测。 |

端口格式为 { id, type, dataType, label? }。target 是输入，source 是输出；ID 在节点内唯一且稳定。outputs 的键必须匹配 source 端口 ID。dataType 可为字符串或字符串数组，\* 表示通配；禁止自连接，并要求方向、存在性与类型相容。

| **输出类型** | **value** |
|-|-|
| STRING | 字符串。 |
| INT / FLOAT | 安全整数 / 有限数值。 |
| BOOLEAN | 布尔值。 |
| IMAGE / MASK / VIDEO / AUDIO | { url: "assets/...", mimeType: "image/png" }，MIME 主类型须匹配；MASK 使用 image/。 |

端口可声明自定义类型名，但当前输出校验只支持上表。增加类型名本身不会实现新的输出协议。

给示例增加 id="in"、type="target"、dataType="STRING" 端口，并从原有 useNode 解构取得 nodeEvent 后，可订阅输入：

```typescript
nodeEvent.on("input:in", values => {
  const input = values.find(item => item.dataType === "STRING" && typeof item.value === "string");
  if (input?.dataType === "STRING" && typeof input.value === "string") {
    outputs.value.text.value = input.value;
  }
});
```

输入是数组；连接尚无输出时仍有来源记录，value 为 undefined。订阅会立即执行并随连接/内容变化更新，不自动运行上游节点。主动查询使用 useNodeInputs 的 getTargetValues、getTargetSources、getSourceValue。

## 5. 事件与 Agent 节点操作

在 setup 中同步注册 nodeEvent.on，返回注销函数，卸载时自动清理。

| **事件** | **职责** |
|-|-|
| input:`<id>` / output:`<id>` | 监听输入数组 / 单个输出，避免回写循环。 |
| save | 等待文件保存；参数为 reload 时将重载，可抛错阻止刷新。 |
| copy | 返回合并到副本 data 的对象，例如文本快照。 |
| delete | 清理节点任务；删除前会调用已有 save 回调。 |
| canConnect | 同步返回 true 才通过，不能放宽基础端口校验。 |

将 z 加入运行时 import，在原有 useNode 解构加入 nodeTools，注册修改文本的操作：

```typescript
nodeTools.register({
  name: "setText",
  description: "修改便签的文本内容",
  parameters: z.strictObject({ text: z.string().max(10000) }),
  execute({ text }, { signal }) {
    signal?.throwIfAborted();
    outputs.value.text.value = text;
    return { text };
  },
});
```

函数名为最多 64 字符的小驼峰，暴露为 node:setText。启用画布操作工具后，Agent 通过 getCanvas 查询，再用 nodeTools 调用 { nodeId, name: "node:setText", args: { text: "新内容" } }。

参数应为可转换 JSON Schema 的 Zod 对象，执行前用原 schema 的 parseAsync 校验。返回值可 JSON 序列化，失败抛错；异步操作传递 signal，更新状态前再检查取消。单次最多等待 120 秒，忽略信号的代码不会被自动强制终止。节点操作依赖正在挂载的画布实例。

## 6. 文件与媒体持久化

files.uploadFile(file) 自动在 assets/<节点 ID>/ 下创建随机文件，返回工作区相对路径。媒体输出的 url 保存这个路径；Blob URL 只用于预览，不写进画布 JSON。

以下示例用于已声明 image source 端口（IMAGE）的节点：

```typescript
import { useNode, type NodeOutputs } from "@toonflow/nodes-scaffold/runtime";

const { outputs, files } = useNode<NodeOutputs>();
const imageUrl = files.useFileUrl(() => outputs.value.image?.value as
  { url: string; mimeType: string } | undefined, error => console.error(error));

async function uploadImage(file: File) {
  if (!file.type.startsWith("image/") || !file.size || file.size > 20 * 1024 * 1024) {
    throw new Error("请选择 20 MiB 以内的非空图片");
  }
  const path = await files.uploadFile(file);
  outputs.value.image = { dataType: "IMAGE", value: { url: path, mimeType: file.type } };
}
```

imageUrl 可绑定 img src。useFileUrl 随值变化、预览状态和卸载释放临时 URL；界面捕获上传错误并展示，避免重复上传。

files.getWorkspaceFiles() 返回绑定工作区的文件对象，支持 list/read/readText/readJson/write/writeJson/rename/remove/mkdir。路径使用工作区相对路径，mkdir 不递归创建父目录。多步操作开始时取得一个实例并复用，避免切换项目后写错目录。

长文本参考 packages/nodes/textNode/src/index.vue：正文写 assets/<节点 ID>/content.md，node.data 保存引用，save 等待写入，copy 提供快照。写入成功前不删除原正文，不吞掉错误。支持撤销的宿主会保留素材，替换输出时不要直接删除可能被副本引用的文件。

## 7. 模型与 FFmpeg

从原有 useNode 中取得 ai，使用已配置模型：

```typescript
async function generateText(prompt: string, signal?: AbortSignal) {
  const model = (await ai.getModels(signal))[0];
  if (!model) throw new Error("请先在设置中添加模型");
  const result = await ai.generate({
    providerId: model.providerId,
    modelId: model.modelId,
    prompt,
    signal,
  });
  return result.text;
}
```

onEvent 可接收文本、推理增量和工具事件；references 支持文本、图片、视频。媒体引用使用工作区相对路径，并传 directory 绝对路径快照，可从 files.getWorkspaceFiles().list() 取得。ai.getMediaModels/generateImage/generateVideo 提供媒体能力，结果包含已落盘 path、mimeType。

FFmpeg 在 setup 取得 const { ffmpeg: loadFfmpeg } = useNode()，执行时 await loadFfmpeg(signal)。输入文件和输出父目录应存在：

```typescript
async function convertVideo(signal?: AbortSignal) {
  const ffmpeg = await loadFfmpeg(signal);
  const outputPath = "assets/" + crypto.randomUUID() + ".mp4";
  await new Promise<void>((resolve, reject) => {
    ffmpeg("assets/input.mp4")
      .videoCodec("libx264")
      .audioCodec("aac")
      .on("error", reject)
      .on("end", () => resolve())
      .save(outputPath);
  });
  return { url: outputPath, mimeType: "video/mp4" };
}
```

save 返回命令对象，不是完成 Promise，需监听 end/error。调用经 /api/ffmpeg/execute 在宿主执行，工厂取得时固定工作区目录。支持多输入输出、滤镜、截图、拼接、clone、ffprobe 与能力查询。

节点卸载、外部 signal 或 command.kill 可取消转换。命令开始后不能改配置，并行任务用独立命令或 clone。浏览器接口不接受 Node.js Stream、子进程、logger、执行程序路径 setter 或 pipe；ffprobe/能力查询取消仅停止等待。缺少 FFmpeg 时按宿主提示安装后重试。

## 8. 排查与规范

- 菜单没有节点：检查实际安装目录、启用状态和 /api/nodes/get 的 loadError。
- 仍加载旧代码：确认 dev/watch 已同步，再刷新节点；普通生产构建不更新安装目录。
- 连线无输出：核对端口 ID、outputs 键与数据类型，处理 undefined。
- 重开后媒体丢失：核对相对路径与实际文件，避免持久化 Blob URL。
- 刷新失败：检查 save("reload") 是否等待写入或拒绝正在运行的任务。

Vue、Vue Flow、Element Plus 与相关 Pi SDK 复用宿主实例，不创建另一份 Vue app。第三方组件保留原始导入名，如 ElInput，模板可用 el-input；自有组件使用小驼峰。样式优先 scoped，不加入全页 reset。节点预览槽位按视口挂载，工具注册与任务逻辑放节点本身 setup。

参考源码：packages/nodeScaffold/index.ts、src/runtime.ts、src/useNode.ts、src/nodeAi.ts、src/nodeTools.ts，以及 packages/ffmpeg/src/browser.ts。
