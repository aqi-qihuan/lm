# LanMeng (蓝梦)

<div align="center">

**A comprehensive Go language technical learning and practice project**

[![Go Version](https://img.shields.io/badge/Go-1.27+-00ADD8?style=flat&logo=go)](https://golang.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](.)

</div>

---

## 📖 Introduction

**LanMeng** is a comprehensive Go language technical learning and practice project that covers a variety of technology stacks from basic to advanced. The project includes a complete community platform application (lmbook) and example code for multiple technical modules, suitable for Go language learners and developers as a reference.

### 🎯 Project Vision

- Provide high-quality Go language practical code examples
- Cover mainstream technology stacks: Gin, GORM, gRPC, WebSocket, MongoDB, Elasticsearch, etc.
- Demonstrate production-grade practices such as microservice architecture, Kubernetes deployment, monitoring and operations

---

## 🏗️ Software Architecture

### Core Modules

```
basic-go/
├── lmbook/              # Core application: Community platform backend service
│   ├── account/         # Account management module
│   ├── article/         # Article management module
│   ├── comment/         # Comment module
│   ├── follow/          # Follow relationship module
│   ├── im/              # Instant messaging module
│   ├── payment/         # Payment module
│   ├── ranking/         # Ranking module
│   ├── reward/          # Reward module
│   └── ...
├── gin/                 # Gin framework examples
├── gorm/                # GORM ORM examples
├── grpc/                # gRPC communication examples
├── websocket/           # WebSocket real-time communication examples
├── wire/                # Google Wire dependency injection examples
├── mongodb/             # MongoDB operation examples
├── es/                  # Elasticsearch search examples
├── sarama/              # Kafka Sarama client examples
├── opentelemetry/       # OpenTelemetry observability examples
├── cronk8s/             # Cron job & K8s integration examples
└── k6/                  # Performance testing examples
```

### Technology Stack

| Category | Technology |
|----------|-------------|
| **Frontend Framework** | [Next.js](https://nextjs.org/) + React + TypeScript |
| **Frontend UI** | [Ant Design Pro Components](https://procomponents.ant.design/) |
| **Frontend Rich Text** | [wangEditor](https://www.wangeditor.com/) |
| **Web Framework** | [Gin](https://github.com/gin-gonic/gin) |
| **ORM** | [GORM](https://gorm.io/) |
| **RPC** | [gRPC](https://grpc.io/) |
| **Dependency Injection** | [Google Wire](https://github.com/google/wire) |
| **Configuration** | [Viper](https://github.com/spf13/viper) |
| **Logging** | [Zap](https://github.com/uber-go/zap) |
| **Database** | MySQL, Redis, MongoDB |
| **Search** | Elasticsearch |
| **Message Queue** | Kafka (Sarama) |
| **Monitoring** | Prometheus, OpenTelemetry, Zipkin |
| **Containerization** | Docker, Kubernetes |
| **Testing** | k6 performance testing |

---

## 🚀 Installation

### Prerequisites

- **Go**: 1.27+ (recommended 1.27.1+)
- **MySQL**: 5.7+ or 8.0+
- **Redis**: 6.0+
- **Docker** & **Docker Compose** (optional, for containerized deployment)

### Method 1: Direct Installation (Recommended for Development)

#### Backend (lmbook)

```bash
# 1. Clone the project
git clone <your-repository-url>
cd basic-go

# 2. Download dependencies
make deps
# or
go mod download

# 3. Run the lmbook application (example: account module)
cd lmbook/account
go run main.go
```

#### Frontend (lmbook-fe)

```bash
# 1. Enter frontend directory
cd lmbook-fe

# 2. Install dependencies
npm install
# or
yarn install

# 3. Start development server
npm run dev
# or
yarn dev

# Application will run at http://localhost:3000
```

### Method 2: Docker Deployment (Recommended for Production)

```bash
# 1. Clone the project
git clone <your-repository-url>
cd basic-go/lmbook

# 2. Start all services with Docker Compose (MySQL, Redis, application)
docker-compose up -d

# 3. Check running status
docker-compose ps

# 4. View logs
docker-compose logs -f app
```

### Method 3: Kubernetes Deployment

```bash
# 1. Create MySQL and Redis services
kubectl apply -f lmbook/k8s-lmbook-mysql.yaml
kubectl apply -f lmbook/k8s-lmbook-redis.yaml

# 2. Deploy the application
kubectl apply -f lmbook/k8s-lmbook-service.yaml
kubectl apply -f lmbook/k8s-lmbook-ingress.yaml

# 3. Check Pod status
kubectl get pods -n lmbook
```

---

## 📚 Usage Instructions

### 1. Run Gin Example

```bash
cd gin
go run main.go
```

Visit: `http://localhost:8080/hello`

**API Examples**:
```bash
# Basic route
curl http://localhost:8080/hello

# Path parameter
curl http://localhost:8080/users/John

# Query parameter
curl http://localhost:8080/order?id=12345
```

### 2. Run lmbook Main Application

```bash
cd lmbook/account
go run main.go
```

The application starts on port `:8080` by default.

### 3. Use Make Commands

The project provides a `Makefile` to simplify common operations:

```bash
# Generate Wire dependency injection code
make generate
# or
make mock

# Generate gRPC code (using buf)
make grpc

# Generate gRPC Mock code
make grpc_mock

# Run end-to-end tests (auto-starts docker-compose)
make e2e

# Only start e2e test environment
make e2e_up

# Stop e2e test environment
make e2e_down
```

### 4. Protocol Buffer Development

The project uses [buf](https://buf.build/) to manage Protocol Buffer definitions and code generation.

```bash
# Generate gRPC code (recommended)
make grpc

# Generate gRPC Mock code
make grpc_mock

# Manually generate using buf
buf generate lmbook/api/proto
```

Proto files are located in `lmbook/api/proto/`, including:
- `article/` - Article service
- `interactive/` - Interaction service (likes, favorites, etc.)
- `payment/` - Payment service
- `follow/` - Follow service
```

---

## 🤝 Contribution

We welcome your contributions! Please follow these steps:

### Contribution Workflow

1. **Fork this repository** to your GitHub/Gitee account

2. **Clone your Fork**
   ```bash
   git clone https://gitee.com/your-username/basic-go.git
   cd basic-go
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   # or fix a bug
   git checkout -b fix/bug-description
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add XXX feature"
   # or
   git commit -m "fix: fix XXX problem"
   ```

5. **Push to your Fork**
   ```bash
   git push origin feat/your-feature-name
   ```

6. **Create a Pull Request**
   - Create a PR to the original repository
   - Describe your changes
   - Wait for code review

### Code Standards

- Follow Go official code style (use `gofmt` to format)
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) specification
- Add necessary comments and documentation
- Ensure new code passes tests

### Report Bugs

Please describe in detail in Issues:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment information (OS, Go version, etc.)

---

## ✨ Features

- ✅ **Modular Design**: Each technology stack has independent example modules for easy learning and reference
- ✅ **Production-grade Practices**: The lmbook module demonstrates a complete community platform architecture design
- ✅ **Containerization Support**: Provides complete Docker and Kubernetes deployment configurations
- ✅ **Observability**: Integrated with Prometheus and OpenTelemetry for easy monitoring and tracing
- ✅ **Dependency Injection**: Uses Google Wire to implement elegant dependency management
- ✅ **Multi-language README**: Supports Chinese and English documentation

### Related Resources

1. Use `README_XXX.md` to support different languages, e.g., `README_en.md`, `README_zh.md`
2. Gitee official blog [blog.gitee.com](https://blog.gitee.com)
3. You can explore excellent open source projects at [https://gitee.com/explore](https://gitee.com/explore)
4. [GVP](https://gitee.com/gvp) stands for Gitee Most Valuable Open Source Project, which is an excellent open source project comprehensively evaluated
5. Gitee official user manual [https://gitee.com/help](https://gitee.com/help)
6. Gitee Cover Personality is a column to showcase the elegance of Gitee members [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

If you have any questions or suggestions, please contact us through:

- Submit an Issue
- Create a Pull Request
- Send email to: [your-email@example.com]

---

<div align="center">
  <strong>⭐ If this project helps you, please give it a Star! ⭐</strong>
</div>
