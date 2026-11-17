# Toonflow 文档站

基于 [VitePress](https://vitepress.dev/) 的文档站，整合了仓库内的开发文档、README 核心介绍、飞书《Toonflow 新手使用教程》与《Toonflow 插件开发指南》，构建后由 GitHub Actions 发布到 GitHub Pages。

## 目录

```text
docs-site/
  .vitepress/config.mts   站点配置、导航与侧边栏
  index.md                首页：亮点、文档导航、截图、常见问题
  guide/                  使用教程：新手入门、安装、画布、工具、视频合成、插件市场、Agent
  plugins/                插件开发：开发总览、Tools、Nodes、Skill、Teams、交付检查、发布
  development/            开发文档：概览、本地开发、扩展、多语言、桌面构建、项目结构
  deploy/                 部署运维：服务端部署、版本发布、客户端更新
  public/                 站点自身的静态文件（logo/favicon）
```

配图统一放在仓库 `docs/images/`（教程配图在 `docs/images/tutorial/`，插件开发配图在 `docs/images/plugins/`），页面内以相对路径引用，构建时由 Vite 处理为带 hash 的静态资源，不在本目录重复存放图片。

## 本地开发

```sh
cd docs-site
bun install
bun run dev      # http://localhost:5173/toonflow/
bun run build    # 产物：.vitepress/dist
bun run preview  # 预览构建产物
```

站点 `base` 默认 `/toonflow/`（GitHub Pages 项目站点），本地部署到根域名时用 `DOCS_BASE=/ bun run build` 覆盖。

## 发布

`.github/workflows/docs.yml` 在推送到 `master` 且改动涉及 `docs-site/**` 或 `docs/**` 时构建，也可在 Actions 中手动运行。构建产物只推送到 **`gh-pages` 分支**（每次 force push 成单提交历史，带 `.nojekyll`），`master` 上不保存任何构建结果，只保留文档源码。

仓库需在 **Settings → Pages → Source** 选择 **Deploy from a branch**，分支 `gh-pages`、目录 `/`。

首次开启或切换来源：

```sh
gh api -X PUT repos/dolfly/toonflow/pages \
  -F build_type=legacy \
  -F source[branch]=gh-pages \
  -F source[path]=/
```

站点地址：<https://dolfly.github.io/toonflow/>

## 内容维护

- 教程内容来自飞书文档《Toonflow 新手使用教程》，更新时同步修改 `guide/` 下对应页面，并把新配图放进 `docs/images/tutorial/`。
- 插件开发内容来自飞书文档《Toonflow 插件开发指南》，一章一页对应 `plugins/` 下 7 个文件（`overview`/`tools`/`nodes`/`skill`/`teams`/`checklist`/`publish`）。**代码块必须原样保留**（含语言标注），示例是开发文档的主体价值，不改写、不省略、不改成示意版。
- 开发文档与 `docs/development.md` 内容一致，改动时两处同步，避免仓库内文档与站点漂移。插件安装契约在 `development/plugins.md`，从零开发到发布在 `plugins/` 分组，两边不重复叙述。
- 站内链接全部使用相对的 `.md` 路径，构建后即可校验无 404。
