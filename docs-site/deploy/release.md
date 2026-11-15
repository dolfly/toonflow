# 版本发布与 CI

## 通过版本标签自动发布

发布直接使用现有提交上的 `vX.Y.Z` 标签，无需 Git Flow 或 release 分支。

1. 提交要发布的代码，在 SourceTree 中选中该提交，点击 **标签**。
2. 填写完整标签名，例如 `v2.0.0`，确认标签指向要发布的提交。
3. 在左侧标签列表右键这个新标签，选择 **推送标签**，目标选择正式仓库 `origin`。只推送本次标签，不勾选“推送所有标签”。

推送标签会一并上传它所引用的提交，无需创建或推送发布分支。GitHub Actions 会自动运行 **Release Toonflow**，构建六种桌面目标与 Android ARM64，全部成功后创建对应 GitHub Release。

也可在仓库终端执行下面两条命令（将 `2.0.0` 换成本次版本）：

```sh
git tag -a v2.0.0 -m "Release v2.0.0"
git push --no-follow-tags origin refs/tags/v2.0.0:refs/tags/v2.0.0
```

版本格式为小写 `v` 加 `X.Y.Z`；轻量标签和附注标签均支持。使用新的版本号，不覆盖已有标签。构建失败时，在 Actions 中查看日志；代码不变可重跑任务，修改代码后使用新版本号。

## 一次构建全部平台

在 GitHub 仓库打开 **Actions → Release Toonflow → Run workflow**，选择要发布的可信分支，填写版本号（例如 `2.0.1`），将 `ref` 留空后运行。推送 `vX.Y.Z` 标签同样会触发发布。包含任一种 Mac 的签名构建要求 `ref` 与触发工作流的分支或标签指向同一提交，不允许借此切换到其他提交；在 Debug 工作流仅构建 Windows、Linux 或 Android 时可指定其他 `ref`。

工作流使用各系统与架构的原生运行器构建，全部成功后统一上传到对应 GitHub Release：

| 平台 | 安装包 | 更新文件 |
| --- | --- | --- |
| Windows x64 | `toonflow-<版本号>-Setup.exe` | `stable-win-x64-*` |
| Windows ARM64 | `toonflow-<版本号>-win-arm64-Setup.exe` | `stable-win-arm64-*` |
| macOS Intel | `toonflow-<版本号>-macos-x64.dmg` | `stable-macos-x64-*` |
| macOS Apple Silicon | `toonflow-<版本号>-macos-arm64.dmg` | `stable-macos-arm64-*` |
| Linux x64 | `toonflow-<版本号>-linux-x64.deb` | `stable-linux-x64-*` |
| Linux ARM64 | `toonflow-<版本号>-linux-arm64.deb` | `stable-linux-arm64-*` |
| Android ARM64 | `toonflow-<版本号>-android-arm64.apk` | APK 随 Release 发布，不使用桌面更新清单 |

各桌面目标包含完整更新包 `.tar.zst`、更新清单 `*-update.json`，以及 **GitHub 最新发布版 → 当前版本**的 `<平台前缀>-<旧 hash>.patch`。首次发布找不到该目标清单（HTTP 404）时只生成安装包和完整更新包；Intel Mac 首次遇到旧 SDK 清单时也只生成统一 SDK 的首版完整包。其他网络错误、无效清单或缺失 patch 会中止构建。版本号必须高于更新源中的上一版。

构建固定使用 GitHub Releases 的 `releases/latest/download` 读取上一版清单及完整包，用于生成补丁。GitHub Actions 使用当前工作流仓库（`GITHUB_SERVER_URL` / `GITHUB_REPOSITORY`），本机构建默认使用 `HBAI-Ltd/Toonflow-app`。此地址写入 SDK 的构建配置，不受客户端设置影响；客户端运行时在“设置 → 关于”选择更新源，默认使用官方源 `https://api.toonflow.net/version/desktopUpdates`，也可切换到 GitHub Releases。开发者选项可保存一个自定义更新文件目录地址，保存后会出现在“关于”的更新源下拉框。Release 工作流会上传安装包和更新文件到 GitHub Release，再通过配置的托管接口登记六个桌面目标；使用独立更新服务时按其说明单独同步，见[客户端更新与增量发布](./updates.md)。

[Debug 工作流](https://github.com/dolfly/toonflow/blob/master/.github/workflows/debug.yml) 可单独选择平台或全部平台，产物保留 7 天，不创建 Release。默认只打完整包，勾选 `generatePatch` 可验证增量构建。CI 构建和归档检查不等于已验证真实安装、GUI 启动或 macOS Gatekeeper。

## Windows 代码签名

Windows 安装器和自有辅助 EXE 会写入产品、发布者与当前构建版本信息。默认没有签名证书，构建会明确提示产物未签名；版本信息不能代替数字签名，也不代表已通过 Defender 检测。

在有代码签名证书及匹配私钥的 Windows 构建机上，将证书安装到当前用户的 `My` 证书库，安装 Windows SDK 的 SignTool，并在执行现有打包命令前设置：

```powershell
$env:windowsSigningThumbprint = '证书的40位十六进制指纹'
$env:windowsSignToolPath = 'C:\Program Files (x86)\Windows Kits\10\bin\实际SDK版本\x64\signtool.exe'
bun run package:desktop
```

SignTool 已在 PATH 时可省略 `windowsSignToolPath`；指定路径时必须使用绝对路径，避免不同构建阶段的工作目录影响工具选择。未设置 `windowsSigningThumbprint` 才会跳过签名，显式空字符串、空白或无效指纹均报错。签名采用 SHA-256 与 RFC 3161 时间戳，默认使用 `http://timestamp.digicert.com`，可通过 `windowsSigningTimestampUrl` 指定证书服务商的时间戳地址。私钥保留在证书库或提供商的硬件中，不向脚本传递证书密码。

四个自有启动、协议、保存与更新辅助程序在 SDK 生成更新归档、Hash 和补丁前完成签名；安装检测程序、NSIS 内嵌卸载器和最终安装包也会签名并验证。NSIS 打包使用归档中的更新助手，并校验归档内四个辅助程序的版本；启用签名时还校验其签名、证书指纹和时间戳，不能用未签名旧归档只重签外壳。第三方文件保留其原有签名。配置了证书指纹后，证书、时间戳或签名验证失败均中止打包，不回退为未签名产物；最终 EXE 在暂存目录完成签名后才替换产物，失败不覆盖已有安装包。当前 GitHub 托管 Windows 运行器尚未配置证书，仍输出未签名包；启用 CI 签名需要先提供可用的签名身份。

签名接入与编译通过不等于误报已解除。Defender 已检测的原始文件需结合保护历史记录复核，必要时通过 [Microsoft Security Intelligence](https://www.microsoft.com/en-us/wdsi/filesubmission) 以软件开发者身份提交分析。

## macOS 自动签名与公证：首次配置

在 GitHub 仓库的 **Settings → Secrets and variables → Actions → New repository secret** 添加：

| Secret | 内容 |
| --- | --- |
| `MACOS_CERTIFICATE_BASE64` | `.p12` 文件，包含唯一有效的 **Developer ID Application** 证书及匹配的私钥，编码为 Base64。 |
| `MACOS_CERTIFICATE_PASSWORD` | 导出该 `.p12` 时设置的非空密码。 |
| `MACOS_NOTARIZATION_KEY_ID` | App Store Connect 团队 API 密钥的 Key ID。 |
| `MACOS_NOTARIZATION_ISSUER_ID` | 该团队 API 密钥的完整 Issuer ID，不是 Team ID。 |
| `MACOS_NOTARIZATION_KEY_BASE64` | 对应 API 密钥的 `.p8` 私钥文件，编码为 Base64。 |

在 Windows PowerShell 中执行以下命令，把路径替换为本机证书路径。命令只复制到剪贴板，不打印证书内容，也不生成文件；随后粘贴到 `MACOS_CERTIFICATE_BASE64` 的 Secret 输入框：

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\证书目录\signing.p12')) | Set-Clipboard
```

然后单独执行下面的命令，把 `.p8` 路径替换为本机文件路径，将剪贴板内容保存到 `MACOS_NOTARIZATION_KEY_BASE64`：

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\证书目录\AuthKey_你的KeyID.p8')) | Set-Clipboard
```

粘贴保存后可执行 `Set-Clipboard -Value ''` 清空剪贴板。密码直接填写到 `MACOS_CERTIFICATE_PASSWORD`，不写进命令、源码或聊天记录。Base64 只是编码，不是加密；P12、P8、Base64、密码均不得提交到公开仓库或上传为构建产物。

公证使用 App Store Connect **团队 API 密钥**，Key ID、Issuer ID 与 P8 必须对应同一把有权限的密钥。应用与 DMG 复用这把公证密钥，更换签名 P12 不要求同时更换仍有效且有权限的公证 API 密钥。这种认证方式不需要 Apple ID 密码或 Team ID；P12 及其密码用于应用和 DMG 签名。

配置后，Debug 与 Release 的两种 Mac 构建都会自动导入临时钥匙串，使用 Developer ID Application 签署应用、原生代码与 DMG，并对应用与 DMG 分别提交 Apple 公证、等待通过、附加并验证公证票据。完整更新归档在应用公证后生成；上传前会验证更新归档中应用的签名和公证票据，并核对是否使用本次导入的 Developer ID Application 证书；DMG 会校验签名与公证票据，并挂载检查其中的应用。

缺少 Secret、没有唯一有效的 Developer ID Application 身份、Apple 拒绝公证或验收失败都会中止构建，不回退为未签名或未公证包。临时 P12 在导入步骤结束后删除；P8 与钥匙串在构建成功、失败或取消后的清理步骤中删除，均放在运行器临时目录。证书 Base64、密码和 P8 Base64 只注入凭据准备步骤，公证 API 标识只额外传给 Mac 构建步骤。公证等待计入工作流现有的 90 分钟超时，超时不会发布。

公开仓库只从可信的手动操作或 `v*` 标签触发签名，不接入 `pull_request` / `pull_request_target`。请用 GitHub Rulesets 保护发布分支及 `v*` 标签，并限制仓库写权限；签名构建会执行所选提交的代码，有权修改发布代码或工作流的人也处于 Secrets 的信任边界内。证书导入方式参见 [GitHub 官方说明](https://docs.github.com/en/actions/how-tos/deploy/deploy-to-third-party-platforms/sign-xcode-applications)。

两种 Mac 的 CI 构建强制同时签名与公证，本机构建默认不启用。公证无需上架 App Store，首次打开仍可能出现确认打开互联网下载应用的提示。CI 验收不代替实际 Mac 上从浏览器下载、安装、启动及升级的验证，参见 [Apple 安全打开应用说明](https://support.apple.com/en-us/102445)。

若凭据准备步骤提示未找到唯一有效的签名身份，查看该步骤后续输出的证书类别、有效期和系统诊断。应用与 DMG 需要 `Developer ID Application`，`Developer ID Installer`、`Apple Development`、`Apple Distribution` 不能替代该身份。若类别正确，仍需检查是否含匹配私钥、是否过期，以及证书信任链；成功导入 P12 不等于存在有效的签名身份。诊断不会打印私钥、密码或证书姓名。

## 文档站构建与发布

文档站（本站）由 `.github/workflows/docs.yml` 构建并发布到 GitHub Pages：

- 触发条件：推送到 `master` 且改动涉及 `docs-site/**` 或 `docs/**`，或在 Actions 中手动运行。
- 构建：Node 22 + `bun install` + `bun run build`（工作目录 `docs-site/`），`DOCS_BASE` 由仓库名注入，产物为 `docs-site/.vitepress/dist`。
- 发布：通过 `actions/upload-pages-artifact` 与 `actions/deploy-pages` 部署，站点地址形如 `https://<owner>.github.io/toonflow/`。
- 仓库设置：**Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**；首次开启也可执行 `gh api -X POST repos/<owner>/toonflow/pages -f build_type=workflow`。

回滚方式：`git revert` 对应提交后重新运行 workflow，或对该 workflow 重新运行上一次成功构建。
