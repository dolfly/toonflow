# 本地开发与构建

## 本地开发

先安装 Git 和项目指定版本的 [Bun](https://bun.sh/)，然后执行：

```sh
git clone https://github.com/dolfly/toonflow.git
cd toonflow
bun install

# 首次开发或修改插件后，构建节点和工具并同步到 data/
bun run dev:plugins

# 同时启动 Web 与业务 Server
bun run dev
```

打开 `http://localhost:5173`。独立 Server 默认监听 `3000`，Web 开发服务会代理 API 请求。`dev` 不会自动构建或同步插件，因此首次启动需要上面的 `dev:plugins` 步骤。

## 常用命令

以下命令在仓库根目录执行：

| 命令 | 用途 |
| --- | --- |
| `bun run dev:web` | 单独启动 Web 开发服务。 |
| `bun run dev:server` | 单独启动业务 Server。 |
| `bun run dev:plugins` | 构建节点和工具，并同步到开发数据目录。 |
| `bun run dev:desktop` | 同步开发插件、构建 Web，并启动桌面应用。 |
| `bun run build` | 构建工具、Web、Server、MCP，并输出技能和提供方文件。 |
| `bun run build:server` | 构建独立部署所需的节点、工具、Web、Server、MCP、技能和提供方，支持 Linux。 |
| `bun run build:nodes` | 构建节点到 `build/nodes/`，不写入 `data/nodes/`。 |
| `bun run build:tools` | 构建默认工具到 `build/tools/`，不写入 `data/tools/`；不包含可选的插件开发套件。 |
| `bun run start:server` | 运行 `build/server/` 中已构建的服务。 |
| `bun run build:desktop` | 构建当前平台的桌面应用及随包资源。 |
| `bun run package:desktop` | 生成当前平台的 Windows NSIS、macOS DMG 或 Linux DEB 安装包。 |
| `bun run release:desktop <版本号> --auto` | 生成当前平台安装包、完整更新包，并在存在上一版时生成 patch。 |
| `bun run typecheck` | 单独执行各工作区的类型检查。 |
| `bun run --cwd packages/i18n extract` | 手动抽取中文源文案和来源索引，不生成其他语言的译文。 |

构建与类型检查分别执行。新增、移动或删除业务接口后，在 `apps/server` 执行 `bun run routes` 生成路由。

Windows 桌面日志位于安装目录的 `app/bin/app.log`。桌面 JavaScript 日志、初始化与依赖加载异常追加到同一文件，保留错误堆栈；启动助手也记录异常退出码。日志采用追加写入，日志不可写时仍保留控制台输出和启动失败提示。

插件开发工具位于 `packages/tools/pluginDeveloper`，作为工作区子包随默认工具构建和内置，产物为 `build/tools/pluginDeveloper.tool.js`，开发构建同步到 `data/tools/`。SDK 下载、缓存和插件构建由工具负责，主程序只提供本机权限校验及安装、刷新、上传桥接。工具私有资源在卸载时一并清理。

## 云端渠道

账号、插件市场、余额统计、探索、首页广告和供应商 TS 的调用链为：页面直接请求本地 `/api/channel/*` → 后端 `Channel` 接口 → `Toonflow` 实现。前端只保留通用 HTTP 工具，不维护渠道抽象。外网地址、响应转换和供应商 TS 临时实现统一放在 `apps/server/src/utils/channel/toonflow.ts`，前后端共享的纯类型通过 `@toonflow/server/channel` 导出。

首页广告请求 `GET /api/channel/community/getAdvertisements`，经渠道转发至正式接口 `POST https://api.toonflow.net/web/toonflow/home/getAdvertisements`（`/web` 是部署代理前缀）。配置入口位于 API 管理后台侧栏“首页广告设置”（`/homeAdvertisement`），读取和保存分别使用管理员服务的 `POST /homeAdvertisement/getSettings`、`POST /homeAdvertisement/saveSettings`，图片通过 `POST /homeAdvertisement/getUploadSignature` 获取直传签名。客户端渠道仅公开读取广告，不转发管理员写入接口。服务端过滤停用和到期广告，返回 `banners`、`bannerMode`（`carousel` 轮换或 `stack` 叠加）、`bannerInterval`（2–60 秒，默认 5）及 `sidebar`；旧 `banner` 字段保留首条可见横幅。旧接口缺少 `banners` 时客户端兼容单条配置，明确的空数组不回退。首次部署按 API 管理员服务的迁移文档初始化广告表；构建不会自动执行数据库迁移。

顶部最多配置 10 条横幅，沿用现有广告表的 `banner.items` JSON 保存 `{ items, mode, interval }`，并镜像首条到旧字段；已有单横幅配置自动兼容，无需增加数据库字段。文字横幅最低 44px，正文支持行内 Markdown、回车换行和自动折行，高度随内容撑开；轮换跟随当前条目高度，叠加按顺序显示，每条可独立关闭。后台保存配置后刷新 Toonflow 首页即可读取；正常使用不要添加 `advertisementPreview` 参数。

本地 API 联调可直接请求管理服务 `62487` 和主服务 `62477`；主 API 设置 `ENABLE_BACKGROUND_JOBS=false`，关闭定时任务及视频、图片回调消费。Toonflow 广告读取统一使用正式地址，已移除临时本地接口覆盖，避免开发配置遮蔽线上已保存的广告。

开发环境仍可通过 `/#/home?advertisementPreview=text`、`image`、`web`、`carousel` 或 `stack` 显式查看临时示例；普通首页与生产构建均使用真实接口，接口失败时不回退到示例。

后端环境变量 `TOONFLOW_CHANNEL` 选择渠道，默认 `toonflow`。新增渠道时，实现 `utils/channel/types.ts` 中的 `Channel`，在 `utils/channel/index.ts` 注册实例，然后设置对应的渠道名称并重启后端；前端和业务路由无需修改。未注册的渠道会明确报错，不会回退到其他渠道。

鉴权请求使用服务端设置中保存的账号 Token，并核对前端携带的账号快照；渠道实例不保存可变 Token。供应商 TS 接口暂时返回空模型配置，真实接口就绪后替换 `Toonflow.getProviderSource`。

## 构建后在本机运行 Web 与 Server

首次从源码运行，完成依赖安装后执行：

```sh
bun run build:server
bun run start:server
```

然后打开 `http://localhost:3000`。这套命令使用仓库根目录的默认 `data/`；服务首次启动会从构建产物初始化内置节点、工具、技能和提供方，保留已有插件文件。迁移到其他目录或机器时，需一并处理运行依赖、配置和工作区，不能只复制 `build/` 就视作完整安装。

独立 Server 采用单进程运行。桌面端复用同一个 `createApp`，在主进程监听系统分配的本机端口。目录选择、原生保存与桌面更新等接口仅由桌面宿主提供。

服务器部署、systemd 托管与数据目录说明见[服务端部署](/deploy/)。
