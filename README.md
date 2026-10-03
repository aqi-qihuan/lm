# 蓝梦 (LanMeng)

<div align="center">

**一个基于 Go 语言的综合社区实践项目**

[![Go Version](https://img.shields.io/badge/Go-1.27+-00ADD8?style=flat&logo=go)](https://golang.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](.)

</div>

---

## 📖 项目介绍

**蓝梦** 是一个综合性的 Go 语言社区实践项目，涵盖了从基础到进阶的多种技术栈实现。项目包含了一个完整的社区平台应用（lmbook）以及多个技术模块的示例代码，适合 Go 语言学习者、开发者参考使用。

### 🎯 项目愿景

- 提供高质量的 Go 语言实践代码示例
- 涵盖主流技术栈：Gin、GORM、gRPC、WebSocket、MongoDB、Elasticsearch 等
- 展示微服务架构、Kubernetes 部署、监控运维等生产级实践

---

## 🏗️ 软件架构

### 核心模块

```
basic-go/
├── lmbook/              # 核心应用：社区平台后端服务
│   ├── account/         # 账户管理模块
│   ├── article/         # 文章管理模块
│   ├── comment/         # 评论模块
│   ├── follow/          # 关注关系模块
│   ├── im/              # 即时通讯模块
│   ├── payment/         # 支付模块
│   ├── ranking/         # 排行榜模块
│   ├── reward/          # 奖励模块
│   └── ...
├── gin/                 # Gin 框架示例
├── gorm/                # GORM ORM 示例
├── grpc/                # gRPC 通信示例
├── websocket/           # WebSocket 实时通信示例
├── wire/                # Google Wire 依赖注入示例
├── mongodb/             # MongoDB 操作示例
├── es/                  # Elasticsearch 搜索示例
├── sarama/              # Kafka Sarama 客户端示例
├── opentelemetry/       # OpenTelemetry 可观测性示例
├── cronk8s/             # 定时任务与 K8s 集成示例
└── k6/                  # 性能测试示例
```

### 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | [Next.js](https://nextjs.org/) + React + TypeScript |
| **前端 UI** | [Ant Design Pro Components](https://procomponents.ant.design/) |
| **前端富文本** | [wangEditor](https://www.wangeditor.com/) |
| **Web 框架** | [Gin](https://github.com/gin-gonic/gin) |
| **ORM** | [GORM](https://gorm.io/) |
| **RPC** | [gRPC](https://grpc.io/) |
| **依赖注入** | [Google Wire](https://github.com/google/wire) |
| **配置管理** | [Viper](https://github.com/spf13/viper) |
| **日志** | [Zap](https://github.com/uber-go/zap) |
| **数据库** | MySQL, Redis, MongoDB |
| **搜索** | Elasticsearch |
| **消息队列** | Kafka (Sarama) |
| **监控** | Prometheus, OpenTelemetry, Zipkin |
| **容器化** | Docker, Kubernetes |
| **测试** | k6 性能测试 |

---

## 🚀 安装教程

### 前置要求

- **Go**: 1.27+ （推荐 1.27.1+）
- **MySQL**: 8.0+ （compose 已升 8.4）
- **Redis**: 6.0+ （compose 已升 7.4）
- **Docker** & **Docker Compose** （可选，用于容器化部署）

### 方式一：直接安装（推荐用于开发）

#### 后端（lmbook）

```bash
# 1. 克隆项目
git clone <your-repository-url>
cd basic-go

# 2. 下载依赖
make deps
# 或
go mod download

# 3. 运行 lmbook 主应用（以 account 模块为例）
cd lmbook/account
go run main.go
```

#### 前端（lmbook-fe）

```bash
# 1. 进入前端目录
cd lmbook-fe

# 2. 安装依赖
npm install
# 或
yarn install

# 3. 启动开发服务器
npm run dev
# 或
yarn dev

# 应用将运行在 http://localhost:3000
```

### 方式二：Docker 部署（推荐用于生产）

```bash
# 1. 克隆项目
git clone <your-repository-url>
cd basic-go/lmbook

# 2. 使用 Docker Compose 启动所有服务（MySQL、Redis、应用）
docker-compose up -d

# 3. 查看运行状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f app
```

### 方式三：Kubernetes 部署

```bash
# 1. 创建 MySQL 和 Redis 服务
kubectl apply -f lmbook/k8s-lmbook-mysql.yaml
kubectl apply -f lmbook/k8s-lmbook-redis.yaml

# 2. 部署应用
kubectl apply -f lmbook/k8s-lmbook-service.yaml
kubectl apply -f lmbook/k8s-lmbook-ingress.yaml

# 3. 查看 Pod 状态
kubectl get pods -n lmbook
```

---

## 📚 使用说明

### 1. 运行 Gin 示例

```bash
cd gin
go run main.go
```

访问：`http://localhost:8080/hello`

**API 示例**：
```bash
# 基础路由
curl http://localhost:8080/hello

# 路径参数
curl http://localhost:8080/users/张三

# 查询参数
curl http://localhost:8080/order?id=12345
```

### 2. 运行 lmbook 主应用

```bash
cd lmbook/account
go run main.go
```

应用默认启动在 `:8080` 端口。

### 3. 使用 Make 命令

项目提供了 `Makefile` 来简化常用操作：

```bash
# 生成 Wire 依赖注入代码
make generate
# 或
make mock

# 生成 gRPC 代码（使用 buf）
make grpc

# 生成 gRPC Mock 代码
make grpc_mock

# 运行端到端测试（会自动启动 docker-compose）
make e2e

# 仅启动 e2e 测试环境
make e2e_up

# 停止 e2e 测试环境
make e2e_down
```

### 4. Protocol Buffer 开发

项目使用 [buf](https://buf.build/) 管理 Protocol Buffer 定义和代码生成。

```bash
# 生成 gRPC 代码（推荐）
make grpc

# 生成 gRPC Mock 代码
make grpc_mock

# 手动使用 buf 生成
buf generate lmbook/api/proto
```

Proto 文件位于 `lmbook/api/proto/` 目录下，包含：
- `article/` - 文章服务
- `interactive/` - 互动服务（点赞、收藏等）
- `payment/` - 支付服务
- `follow/` - 关注服务
```

---

## 🤝 参与贡献

我们非常欢迎你的贡献！请按照以下步骤参与：

### 贡献流程

1. **Fork 本仓库** 到你的 GitHub/Gitee 账号

2. **克隆你的 Fork**
   ```bash
   git clone https://gitee.com/your-username/basic-go.git
   cd basic-go
```

3. **创建功能分支**
   ```bash
   git checkout -b feat/your-feature-name
   # 或修复 bug
   git checkout -b fix/bug-description
   ```

4. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加 XXX 功能"
   # 或
   git commit -m "fix: 修复 XXX 问题"
   ```

5. **推送到你的 Fork**
   ```bash
   git push origin feat/your-feature-name
   ```

6. **创建 Pull Request**
   - 到原仓库创建 PR
   - 描述你的改动
   - 等待代码审查

### 代码规范

- 遵循 Go 官方代码风格（使用 `gofmt` 格式化）
- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- 添加必要的注释和文档
- 确保新增代码通过测试

### 报告 Bug

请在 Issuer 中详细描述：
- 复现步骤
- 期望行为
- 实际行为
- 环境信息（OS、Go 版本等）

---

## ✨ 特技

- ✅ **模块化设计**：每个技术栈都有独立的示例模块，便于学习和参考
- ✅ **生产级实践**：lmbook 模块展示了完整的社区平台架构设计
- ✅ **容器化支持**：提供完整的 Docker 和 Kubernetes 部署配置
- ✅ **可观测性**：集成 Prometheus 和 OpenTelemetry，便于监控和追踪
- ✅ **依赖注入**：使用 Google Wire 实现优雅的依赖管理
- ✅ **多语言 README**：支持中文和英文文档

### 相关资源

1. 使用 `README_XXX.md` 来支持不同的语言，例如 `README_en.md`, `README_zh.md`
2. Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3. 你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4. [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5. Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6. Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)

---

## 📄 开源协议

本项目采用 MIT 开源协议 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 📧 联系方式

如有任何问题或建议，欢迎通过以下方式联系：

- 提交 Issuer
- 创建 Pull Request
- 发送邮件至：[2316364297@qq.com]

---

<div align="center">
  <strong>⭐ 如果这个项目对你有帮助，请给它一个 Star！⭐</strong>
</div>
