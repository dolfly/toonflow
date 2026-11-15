# 下载与安装

## 客户端安装

| 操作系统 | 安装包 |
| --- | --- |
| Windows x64 | [EXE 安装包](https://github.com/dolfly/toonflow/releases) |
| Windows ARM64 | [EXE 安装包](https://github.com/dolfly/toonflow/releases) |
| macOS Apple Silicon（ARM64，macOS 14 及以上） | [DMG 安装包](https://github.com/dolfly/toonflow/releases) |
| macOS Intel（x64，macOS 14 及以上） | [DMG 安装包](https://github.com/dolfly/toonflow/releases) |
| Linux x64（Debian / Ubuntu） | [DEB 安装包](https://github.com/dolfly/toonflow/releases) |
| Linux ARM64（Debian / Ubuntu） | [DEB 安装包](https://github.com/dolfly/toonflow/releases) |
| Android ARM64 | [APK 下载](https://github.com/dolfly/toonflow/releases/latest) |

Android 版仅支持 ARM64 设备，下载发布页中的 `toonflow-版本号-android-arm64.apk` 安装。手机内置本地 Bun 后端，可独立运行；也可从首页「设备互联」扫码或手动连接已开启共享的电脑或远程后端（支持局域网与公网）。

Windows 安装器会自动检测并安装 WebView2；如果安装后打开闪退，请前往 [WebView2 下载页面](https://developer.microsoft.com/microsoft-edge/webview2/) 手动安装运行时。

Windows 的 Intel / AMD 电脑选择 `toonflow-版本号-Setup.exe`，ARM64 电脑选择 `toonflow-版本号-win-arm64-Setup.exe`。ARM64 需要 .NET Framework 4.8.1，较新的 Windows 11 已内置。

Linux 选择对应架构的 `toonflow-版本号-linux-x64.deb` 或 `toonflow-版本号-linux-arm64.deb`，在下载目录执行 `sudo apt install ./安装包文件名.deb`，安装后从应用菜单打开。安装需要联网；apt 会准备 FFmpeg、curl、unzip、CA 证书等依赖，安装脚本在解包应用前下载固定版本的 Bun 并校验大小与 SHA-256，配置阶段再安装运行时。下载或校验失败会在解包前中止安装。

macOS 两种架构均使用统一的 Electrobun SDK，最低支持 macOS 14。选择对应架构的 `toonflow-版本号-macos-arm64.dmg` 或 `toonflow-版本号-macos-x64.dmg`，打开后将 `toonflow.app` 拖入“应用程序”，再从“应用程序”打开 Toonflow。正式发布流程使用 Developer ID Application 签署应用与 DMG，并完成 Apple 公证。旧版 Intel Mac 客户端首次迁移时须下载完整 DMG 覆盖安装，不能通过旧版增量更新直接迁移；安装前退出应用并备份原数据目录。

### macOS 无法安装或打开时的处理方法

**1. 在“隐私与安全性”中允许 Toonflow**

如果提示“无法验证开发者”或“Apple 无法检查 App 是否包含恶意软件”，先尝试打开 Toonflow，再前往“系统设置 → 隐私与安全性”，找到 Toonflow 被阻止的提示，点击“仍要打开”，并按提示确认。详见 [Apple 官方说明](https://support.apple.com/zh-cn/102445)。

**2. 仍因系统隔离限制无法打开时，再尝试移除隔离属性**

确认应用来自官方发布页，并已放入“应用程序”后，在终端执行以下命令，再重新打开。应用名称或安装位置不同时，请调整路径。

```bash
sudo xattr -rd com.apple.quarantine /Applications/toonflow.app
```

**3. 最后手段：临时允许任何来源的 App**

前两种方法均无效且确认应用来源可信时，可尝试在终端执行：

```bash
sudo spctl --master-disable
```

随后打开“系统设置 → 隐私与安全性”，在“安全性”中的“允许从以下位置下载的 App”选择“任何来源”（如果系统提供该选项），并按提示确认。不同 macOS 版本的选项与命令支持可能不同。

::: warning 安全提示
此操作会放宽所有 App 的安全限制。完成后建议将允许来源恢复为“App Store 和被认可的开发者”。
:::

## 安装完成后

装好客户端即可继续[配置模型](./index.md#配置模型)，然后开始建项目。想用 Docker 或服务器方式运行 Web 与 Server，见[服务端部署](/deploy/)。
