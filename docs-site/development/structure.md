# 项目结构

```text
apps/
  web/                 Vue 页面、设置、工作区与画布
  server/              业务接口与 Agent 运行时，桌面共享此服务
  desktop/             Electrobun 入口、构建脚本与安装器
  updateServer/        独立更新文件服务器与发布脚本
packages/
  assets/              共享图片与图标
  i18n/                多语言字典、运行时与文案抽取
  nodes/               内置画布节点
  nodeScaffold/        节点开发脚手架与运行时
  tools/               Agent 工具插件
  toolScaffold/        工具开发脚手架与运行时
  providers/           文本与媒体模型提供方
  skills/              Markdown 技能及附属资料
  mcp/                 MCP 服务与协议适配
  ffmpeg/              FFmpeg 能力
  startup/             原生启动窗口与动画
docs/                  项目介绍译版、开发文档与图片
docs-site/             文档站（VitePress）源码
build/                 构建产物
data/                  本机运行数据，不提交到仓库
```

## 文档目录约定

```text
docs/
  readme.md          文档目录入口
  development.md     开发与扩展指南
  readme/            各语言项目介绍
  images/            标识、认证与社区图片
    screenshots/     产品截图
    sponsors/        赞助商图片
    tutorial/        使用教程配图（文档站引用）
docs-site/
  .vitepress/        站点配置与侧边栏
  guide/             使用教程
  development/       开发文档
  deploy/            部署运维
```

各子包的实现与维护说明保留在对应 `packages/` 目录。更新项目介绍时，以根目录 `README.md` 为准同步其余二十份译版；图片统一复用 `docs/images/`，移动文件时同时更新 Markdown 和 HTML 中的相对链接。

文档站的静态资源直接复用 `docs/images/`（VitePress 的 `publicDir` 指向 `docs/`，站点内以 `/images/...` 引用），因此新增配图只需放入 `docs/images/`，无需在 `docs-site/` 下重复一份。
