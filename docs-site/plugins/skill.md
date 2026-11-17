---
title: "04 · Skill 技能插件开发"
---

Skill 用 Markdown 描述特定任务的方法、步骤和输出要求，可附参考资料、模板和素材。Skill 不需要编译，也不会自行增加工具、节点或执行权限；程序能力由本轮已启用的 tools/nodes 提供。

## 1. 目录与加载范围

```text
storyReview/
  SKILL.md
  references/
    reviewChecklist.md
  templates/
    reviewReport.md
```

SKILL.md 大小写不可改；新建技能名称、目录和资源文件使用小驼峰。references/templates 只是组织约定，不会自动加载。

| **位置** | **用途** |
|-|-|
| 当前项目 skill/storyReview/SKILL.md | 工作区技能，仅当前项目使用；目录为单数 skill。 |
| 数据目录 skills/storyReview/SKILL.md | 全局安装技能，开发环境通常为 data/skills。 |
| packages/skills | 内置技能源码，不是 Agent 直接扫描的运行时目录。 |

Agent 扫描工作区 skill/ 与数据目录 skills/，同名时工作区优先。宿主关闭 SDK 默认目录扫描，放入 .agent/skills 或 .claude/skills 不会自动生效。

内置技能在初始化时补入数据目录；已有初始化标记后，修改源码或更新应用不会持续覆盖已安装技能。调试优先用工作区目录，或重新安装全局版本。

## 2. SKILL.md 字段

文件使用 UTF-8，以 --- 包围 YAML frontmatter，后接 Markdown 正文。

| **字段** | **要求与用途** |
|-|-|
| name | 唯一标识，建议与目录名一致；新技能为不超过 64 字符、以小写字母开头的小驼峰。 |
| description | 必填非空字符串，最多 1024 字符；明确做什么、何时使用。 |
| disable-model-invocation | 可选布尔值。true 表示用户明确指定时使用；省略/false 可自动匹配。 |
| metadata.displayName | 插件市场显示名，缺省使用 name。 |
| metadata.version | 展示和更新比较，发布用完整 SemVer，例如 "1.0.0"。 |
| metadata.author | 作者；Toonflow 被卸载逻辑作为内置标记，自定义技能不要使用该值。 |
| metadata.github | 可选、无账号密码的 [https://github.com](https://github.com) 链接。 |

disable-model-invocation 是 SDK 固定协议字段，保留短横线；SDK 列表中的 disableModelInvocation 是解析后的属性，不可混写。其他字段如 allowed-tools、model 不会开通授权或模型能力。

安装器兼容已有短横线名称，新技能遵循宿主小驼峰规则。当前 SDK 可能对小驼峰产生诊断但仍加载；不要依赖缺失 name 的回退或宽松加载。

## 3. 最小可用示例

在当前项目创建 skill/storyReview/SKILL.md：

```markdown
---
name: storyReview
description: 检查短篇剧本中的人物动机、因果关系和情节连续性。用户要求审阅剧本、查找剧情漏洞或提出修改意见时使用。
metadata:
  version: "1.0.0"
  displayName: 剧本审阅
  author: exampleStudio
---

# 剧本审阅

只审阅用户本次提供或指定的剧本，不擅自改写原文。

1. 确认审阅范围；未提供剧本时，请用户补充正文或文件位置。
2. 阅读完整目标内容，再读取 [审阅检查项](references/reviewChecklist.md)。
3. 按检查项识别问题，为每个问题引用原文中的具体情节。
4. 按“位置、问题、依据、建议”输出结果，建议与原文事实分开。
5. 未发现明确问题时直接说明，不为了凑数制造剧情缺陷。
```

再创建 skill/storyReview/references/reviewChecklist.md：

```markdown
# 审阅检查项

- 人物是否有足以支持当前行动的动机？
- 关键事件之间是否存在明确因果关系？
- 同一人物、物品和事件的状态是否前后一致？
- 信息不足时标记“待确认”，不要当作已证实的错误。
```

本例只需两个文本文件，无需 package.json、构建脚本或 JavaScript 导出。没有附属资料时，可直接分发单个 SKILL.md。

## 4. 自动与显式调用

启用 skillOperator 时，Agent 通过 action=list 查询目录，action=read 按需读取正文与资料。没有该工具时，SDK 提供可自动调用技能的名称、描述和位置，由可用 read 工具读取。可见不代表全文已加载，Skill 不会补齐缺失的操作能力。

显式调用在输入框开头使用：

```text
/skill:storyReview 请审阅下面这段剧本：……
```

也可从技能菜单选择。宿主将主文件正文及位置加入本次消息；附属资料仍按需读取。disable-model-invocation=true 的技能也可显式调用。

普通新一轮请求会重新创建技能资源，skillOperator 目录查询实时扫描。修改后等待当前回复结束，再发新消息验证。运行中的子 Agent 补充消息是文本引导，不展开 /skill: 命令。

## 5. skillOperator 调试

以下为调用参数：

```json
{ "action": "list", "scope": "workspace" }

{ "action": "read", "name": "storyReview", "scope": "workspace" }

{
  "action": "read",
  "name": "storyReview",
  "scope": "workspace",
  "path": "references/reviewChecklist.md"
}
```

| **操作** | **行为** |
|-|-|
| list | 查询目录，可选 scope。 |
| read | 读取正文或资料；必填 name，可选 scope/path。 |
| create | 新建不覆盖，提供 name 与完整 content，新技能先创建 SKILL.md。 |
| update | 完整替换文件，修改前先读取。 |

scope 支持 workspace/global；新建默认工作区。读写省略范围时按工作区优先选取。要访问被同名工作区覆盖的全局技能，显式传 scope=global。

读取、新建、修改开关默认开启，可分别关闭，目录查询保留。content 单次最多 200000 字符，path 必须在技能内。这些开关只约束 skillOperator，不是所有工具的统一权限控制。

## 6. 参考资料与脚本

Markdown 相对链接以当前文档目录为基准。skillOperator 的 path 始终相对技能根目录，读取时需换算路径并去掉章节锚点。跨技能先查询真实名称与 scope，不假定全局/工作区技能在同一父目录。

包内脚本不会被安装器或技能加载过程自动执行。若需要脚本，正文说明用途、输入输出与环境，并确认本轮已有可执行它的工具；稳定程序能力建议独立 tools 插件。

## 7. 打包、安装与更新

仅主文件可安装 .md，保存时统一为 SKILL.md；有资源推荐 ZIP：

```text
storyReview.zip
  storyReview/
    SKILL.md
    references/
      reviewChecklist.md
```

也支持 SKILL.md 与 references 直接位于包根目录。必须恰好一个准确命名的 SKILL.md，所有资源在其目录内；不要附带同级其他技能、说明文件或整个仓库。安装目录取自 frontmatter.name。

在 storyReview 的父目录执行 PowerShell：

```powershell
Compress-Archive -LiteralPath .storyReview -DestinationPath .storyReview.zip -Force
```

从插件市场已安装页或“设置 → 开发者选项 → 手动安装插件”选择技能安装。正常同名更新要求 metadata.version 更高；开发调试可强制安装。**更新会替换整个技能目录**，新版未包含的旧资料不保留。

- 上传/下载包与解包总量均最多 20 MiB，最多 2000 个文件和目录。
- ZIP 支持普通存储或 Deflate，不支持加密和 ZIP64。
- TAR 使用普通 USTAR，不支持 PAX/GNU 扩展条目。
- 拒绝链接、设备等特殊文件、越界路径、重名、大小写冲突和系统保留名称。
- SKILL.md 必须为有效 UTF-8；二进制资源可随包保存，但文本编辑器不用于编辑二进制文件。

插件市场可导出全局技能为 ZIP。编辑主文件不能修改 name；保存不会自动升级 metadata.version。移动资料后同步修正正文链接，排序仅影响显示。

## 8. 验证与排查

1. 放入工作区 skill/，在技能菜单或 skillOperator 确认目录信息。
2. 显式调用 /skill:storyReview，检查正文要求和引用资料被使用。
3. 用匹配描述的自然语言验证自动选择，手动技能不应被主动套用。
4. 打包安装全局版本，用 scope=global 查询，避免同名工作区覆盖造成误判。
5. 升级后核对版本、正文和全部附属资源。

不显示时检查目录、大小写、YAML、name/description；旧内容优先检查同名覆盖与运行中会话。修改 packages/skills 不等于更新安装副本。

参考源码：apps/server/src/agent/skills/index.ts、apps/server/src/agent/runtime/resources.ts、apps/server/src/utils/plugins/install.ts、apps/server/src/routes/skills，以及 packages/tools/skillOperator。
