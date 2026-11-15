# 服务端部署

适用于直接在 Linux 服务器上运行 Web 与 Server，或使用 Docker 运行整套环境。以下以 Ubuntu / Debian 为例，使用项目指定的 [Bun 1.4.3](https://bun.sh/docs/installation)。

## 服务器安装

安装运行环境：

```sh
sudo apt-get update
sudo apt-get install -y git curl unzip ffmpeg
curl -fsSL https://bun.com/install | bash -s "bun-v1.4.3"
export PATH="$HOME/.bun/bin:$PATH"
bun --version
```

克隆源码并启动：

```sh
git clone https://github.com/dolfly/toonflow.git
cd toonflow
bun install --frozen-lockfile

# 构建内置节点、工具、Web 与 Server
bun run build:server
mkdir -p data/workspaces/myProject
bun run start:server
```

看到“服务启动成功”后，可在服务器本机访问 `http://127.0.0.1:3000`。上述命令以前台方式运行，按 `Ctrl+C` 停止；需要开机自启和进程托管时，可参考 [Bun 的 systemd 部署指南](https://bun.sh/guides/ecosystem/systemd)，将工作目录设为仓库目录，启动命令设为 Bun 的绝对路径加 `run start:server`，使用有权读写该目录的用户运行。

## Docker 安装

先安装 Git、[Docker Engine](https://docs.docker.com/engine/install/) 和 Docker Compose；Windows / macOS 可使用 Docker Desktop 的 Linux 容器模式。仓库提供 [Dockerfile](https://github.com/dolfly/toonflow/blob/master/Dockerfile)、[Compose 配置](https://github.com/dolfly/toonflow/blob/master/compose.yaml) 和 [构建排除规则](https://github.com/dolfly/toonflow/blob/master/.dockerignore)，基于 Bun 1.4.3 构建，镜像内包含 FFmpeg。

克隆源码后，在仓库根目录执行：

```sh
git clone https://github.com/dolfly/toonflow.git
cd toonflow
docker compose up -d --build
```

首次构建会安装依赖并编译内置节点、工具、Web 与 Server。启动后访问 `http://127.0.0.1:3000`；远程主机可按下方“访问与数据说明”通过 SSH 隧道访问。首次启动会初始化内置插件，并提供 `myProject` 工作目录。

配置、插件和项目文件保存在 Docker 命名卷 `toonflowData` 中，挂载至容器的 `/app/data/`。卷的实际名称带有 Compose 项目前缀；停止或重建容器会保留数据，**请勿使用 `docker compose down -v`，该命令会删除数据卷**。

```sh
docker compose logs -f toonflow  # 查看日志
docker compose stop             # 停止服务
docker compose start            # 再次启动
docker compose down             # 删除容器，保留数据卷
```

需要增加项目目录时，可在页面的“选择服务器工作目录”弹窗中点击“新建文件夹”。弹窗也支持文件和文件夹的重命名、删除。也可在服务运行期间通过命令行创建：

```sh
docker compose exec toonflow mkdir -p /app/data/workspaces/newProject
```

备份时先停止服务，复制完成后再启动：

```sh
docker compose stop
docker compose cp toonflow:/app/data ./toonflowBackup
docker compose start
```

## 访问与数据说明

- 当前服务使用固定端口 `3000`，业务页面与 API 没有独立登录鉴权。服务器安装时，请通过防火墙或安全组限制 `3000` 端口的访问来源；公网访问需配置带认证的反向代理。
- 个人远程使用可在自己的电脑上执行 `ssh -N -L 3000:127.0.0.1:3000 用户名@服务器地址`，保持连接后打开 `http://127.0.0.1:3000`，无需将服务器的 `3000` 端口向公网开放。
- 直接安装时，配置、插件与工作区默认保存在仓库的 `data/`；Docker 安装则保存在数据卷内的 `/app/data/`。迁移或备份时请完整保留。进入页面后选择服务器工作区内的 `myProject`，更多项目可在对应的 `workspaces/` 下创建子目录。
- 两种安装方式均包含系统 FFmpeg。模型服务的 API Key 仍需在页面内配置。

## 从构建产物运行

首次从源码运行，完成依赖安装后执行：

```sh
bun run build:server
bun run start:server
```

然后打开 `http://localhost:3000`。这套命令使用仓库根目录的默认 `data/`；服务首次启动会从构建产物初始化内置节点、工具、技能和提供方，保留已有插件文件。迁移到其他目录或机器时，需一并处理运行依赖、配置和工作区，不能只复制 `build/` 就视作完整安装。

独立 Server 采用单进程运行。桌面端复用同一个 `createApp`，在主进程监听系统分配的本机端口。目录选择、原生保存与桌面更新等接口仅由桌面宿主提供。

## 云平台部署

合作平台 [智星云](https://www.ai-galaxy.com/) 提供官方授权的 Toonflow 商用镜像，可直接使用预装环境。具体步骤见 [镜像部署图文教程](https://mp.weixin.qq.com/s/lq9X1ovQ1_TKeXMOLgicKg?scene=1)。
