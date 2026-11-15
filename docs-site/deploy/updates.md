# 客户端更新与增量发布

桌面用户可在“设置 → 关于”检查更新、下载并重启应用。Windows 更新交换程序目录，保留 `data/` 和 `WebView2/`；卸载时也默认保留这些数据，选择“同时删除用户数据”才会一并清理。

## 独立更新服务

独立更新服务与业务 Server 分开运行，默认地址为 `http://127.0.0.1:8091`。其配置、部署与发布规则见 [应用更新服务说明](https://github.com/dolfly/toonflow/blob/master/apps/updateServer/readme.md)。

```sh
bun run start:updateServer

# 本机仅构建当前系统与架构；自动判断是否已有上一版
bun run release:desktop 2.0.0 --auto
bun run publish:update build/desktop/releases/2.0.0

# 服务器保留上一版时，构建并发布下一版本
bun run release:desktop 2.0.1
bun run publish:update build/desktop/releases/2.0.1
```

Windows x64 发布目录保留 `build/desktop/releases/<版本>/`；其他目标分别增加 `windowsArm64/`、`macX64/`、`macArm64/`、`linuxX64/` 或 `linuxArm64/`，例如 `build/desktop/releases/macArm64/2.0.1`。所有 release 模式都会生成安装包；`--auto` 自动判断基线，不带选项要求已有上一版，`--initial` 跳过基线检查且不生成 patch。同一平台、架构和版本不能重复生成快照。普通 `build:desktop`、`package:desktop` 不访问更新服务器。

## 更新源

客户端在“设置 → 关于”选择更新源：

- 默认官方源 `https://api.toonflow.net/version/desktopUpdates`。
- 可切换到 GitHub Releases。
- 开发者选项可保存一个自定义更新文件目录地址，保存后会出现在更新源下拉框。

构建固定使用 GitHub Releases 的 `releases/latest/download` 读取上一版清单及完整包，用于生成补丁；使用独立更新服务时按上面的命令单独同步。

## 更新包与增量基线

- 每个桌面目标发布完整更新包 `.tar.zst`、更新清单 `*-update.json`，以及“GitHub 最新发布版 → 当前版本”的 `<平台前缀>-<旧 hash>.patch`。
- 首次发布找不到该目标清单（HTTP 404）时只生成安装包和完整更新包。
- 其他网络错误、无效清单或缺失 patch 会中止构建；版本号必须高于更新源中的上一版。
- Windows 的 `.tar.zst` 更新归档仍保留 Bun，以兼容已安装的旧版更新助手；仅 NSIS 安装包使用剔除运行时的独立归档。因此通过精简安装包安装后，首次更新会使用完整更新包，之后恢复正常增量更新。
- Linux DEB 不内置 Bun，但 SDK 的完整 `.tar.zst` 归档继续保留 Bun，更新清单、Hash 与增量基线不因 DEB 精简而改变。

## 内置插件同步

内置节点与工具按构建 hash 同步：升级或降级后首次启动会替换同名内置插件；Windows 同版本重装也会触发同步。普通重启不重复覆盖。技能和提供方按首次初始化规则处理，保留已有文件；第三方插件和用户素材不随内置节点、工具的同步被覆盖。
