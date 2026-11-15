# 桌面构建与打包

六种桌面目标统一使用 Electrobun 2.0.5：Windows、macOS、Linux，各支持 x64 / ARM64。需要在对应系统与架构上构建，不提供跨系统交叉打包。安装工作区依赖后，首次构建或单独类型检查前显式准备当前平台 SDK：

```sh
bun apps/desktop/node_modules/electrobun/bin/electrobun.cjs prepare
```

## Windows

运行应用需要 WebView2；ARM64 还需 .NET Framework 4.8.1，较新的 Windows 11 已内置。构建脚本通过 `%WINDIR%/Microsoft.NET/Framework64/v4.0.30319/csc.exe` 编译辅助程序。打包需要 NSIS，默认查找 `C:/Program Files (x86)/NSIS/makensis.exe`，可通过 `NSIS_PATH` 指定路径。首次打包会下载并验证微软 WebView2 引导程序。

```sh
bun run build:desktop
bun run package:desktop
```

Windows x64 安装包为 `toonflow-<版本>-Setup.exe`，ARM64 为 `toonflow-<版本>-win-arm64-Setup.exe`，分别位于 `build/desktop/artifacts/`、`build/desktop/artifacts/windowsArm64/`。

NSIS 安装包不内置 Bun。安装器会自动打开“必要运行时下载”，提供 npmmirror、CNPM 备用线路、GitHub 官方源、SourceForge 镜像四个预设入口，并在系统代理和直连之间自动回退；所有组合失败后才提示重试。npmmirror 与 CNPM 属于同一维护体系，使用不同下载入口，不视为两个独立镜像运营方。高级设置默认折叠，下载中可以暂停、切换来源或取消，缓存位于 `%LOCALAPPDATA%/local.toonflow.desktop/runtime/bun/<版本>/<架构>`。下载的 ZIP 与可执行文件均校验固定大小和 SHA-256，不接受任意版本替换。`/S` 安装使用相同下载流程，不显示交互窗口。首次下载成功后，重新安装可以复用已校验缓存。

线路探测最多 4 路并发，每次仅请求实际 ZIP 的前 32 KiB；单次目标上限 2 秒、整个阶段预算 6 秒，每条线路首次成功后才做第二次确认。出现连续两次成功的候选后，再留 500 毫秒比较其他已启动的线路，然后中断剩余探测、等待工作任务结束并开始单路下载；未测或探测失败的线路继续保留为后备。暂停、取消或更改设置会同时停止全部探测。短时结果只代表当前连接表现；操作系统的 DNS、代理和取消收尾仍可能增加实际等待时间，不承诺所有网络下恰好 6 秒结束。

为兼容已经安装的旧版更新助手，Windows 的 `.tar.zst` 更新归档仍保留 Bun；仅 NSIS 使用剔除运行时的独立归档，解压后删除这份归档，不将它冒用为原始增量基线。因此通过精简安装包安装后，首次更新会使用完整更新包，之后恢复正常增量更新。构建时的 Bun 版本和下载摘要由 `apps/desktop/runtimeInfo.json` 锁定，并与 Hutch 的托管版本核对；升级 SDK 携带的 Bun 时需同步核验相关平台的清单。

## macOS

最低支持 macOS 14。先安装 Xcode Command Line Tools，Intel 与 Apple Silicon 使用同一 SDK 和构建入口。

在对应架构的 Mac 上生成原生启动库，然后构建：

```sh
bun packages/startup/scripts/buildMac.ts
bun run build:desktop
bun run package:desktop
```

启动库脚本会下载固定版本的 ThorVG 源码并校验摘要。安装包为 `toonflow-<版本>-macos-<架构>.dmg`，产物分别位于 `build/desktop/artifacts/macArm64/` 和 `build/desktop/artifacts/macX64/`。打开 DMG 后将 `toonflow.app` 拖入“应用程序”，再从“应用程序”打开 Toonflow。

原 PKG 打包实现已备份到 `apps/desktop/scripts/packageMacPkg.ts`，当前打包入口使用 DMG。以后恢复 PKG 时，除应用签名所需的 Developer ID Application 证书及私钥，还需要 Developer ID Installer 证书及匹配私钥。

macOS 默认内置 Bun，当前 DMG 打包不支持外置运行时试验，显式设置 `TOONFLOW_EXTERNAL_RUNTIME=1` 会中止打包。原 PKG 的精简安装与运行时下载逻辑随 `packageMacPkg.ts` 保留，但该备份不是当前构建或发布入口，恢复使用需要另行接入。外置 Bun 的可执行路径会改变系统识别的主 Bundle，仅修正 SDK 资源路径和工作目录不能保证麦克风权限、协议链接与应用身份正常；需要在 Intel、Apple Silicon Mac 上解决并验证这些行为，再考虑正式启用。

本机默认生成未做 Developer ID 签名与公证的开发包；GitHub Actions 的两种 Mac 包都会按[发布流程中的签名配置](/deploy/release)自动签名并公证。旧版 Intel 客户端首次迁移到统一 SDK 版本时，须下载完整 DMG 覆盖安装，不能通过旧版增量更新直接迁移；安装前退出应用并备份原数据目录。对于自己构建且确认来源的开发应用，若被隔离属性拦截，可仅移除该应用的隔离属性，路径按实际位置调整：

```sh
xattr -dr com.apple.quarantine "/Applications/toonflow.app"
```

## Linux

使用系统 GTKWebKit，不捆绑 CEF。以下以 Ubuntu 24.04 为例，显式安装桌面运行库与打包工具后构建：

```sh
sudo apt-get update
sudo apt-get install -y --no-install-recommends \
  libgtk-3-0t64 libwebkit2gtk-4.1-0 libayatana-appindicator3-1 librsvg2-2 \
  zenity ffmpeg dpkg
bun run build:desktop
bun run package:desktop
```

安装包为 `toonflow-<版本>-linux-<架构>.deb`，产物分别位于 `build/desktop/artifacts/linuxX64/`、`build/desktop/artifacts/linuxArm64/`。使用 `sudo apt install ./安装包文件名.deb` 安装时会准备所需系统依赖与 FFmpeg，并先安装 `Pre-Depends` 声明的 `ca-certificates`、`curl`、`unzip`。安装需要可访问下载源的网络。

DEB 不内置 Bun 二进制。`preinst` 在首次安装、重装或升级的解包前阶段，准备 `apps/desktop/runtimeInfo.json` 锁定版本与架构的 ZIP，校验固定大小和 SHA-256，再流式解压指定成员到缓存临时文件并校验二进制大小和 SHA-256；下载或校验失败会在解包前中止安装。`postinst` 在配置阶段复核缓存与解压出的二进制，最后原子替换 `/opt/toonflow/bin/bun`；该阶段已有有效运行时可直接复用，不重新下载。

匹配版本与架构的 ZIP 缓存位于 `/var/cache/toonflow/bun-<版本>-linux-<架构>.zip`，由 root 持有且仅 root 可访问，复用前重新校验；重装与升级也先确保缓存有效。卸载由包管理器删除安装目录中的 Bun，下载缓存保留，不触碰用户项目与配置。SDK 的完整 `.tar.zst` 更新归档继续保留 Bun，更新清单、Hash 与增量基线不因 DEB 精简而改变。

完成 SDK 准备后，可显式运行 `bun run typecheck`。类型检查不会隐式安装依赖或编译原生库。
