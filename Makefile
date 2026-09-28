# 你可以直接执行 make 命令，也可以单独的命令复制到控制台。
# 注意，如果你是 Windows 并且不是在 WSL 下，
# 要注意文件分隔符使用 Windows 的分隔符。

# ============ 本机构建环境（绕过 D 盘模块缓存被系统钩子拦截的问题）============
# 缓存放工作区内；旧缓存作为 file:// 代理源复用；goproxy.cn 直连不走代理
export GOMODCACHE := $(CURDIR)/.gomodcache
export GOCACHE := $(CURDIR)/.gocache
export GOPROXY := file:///D:/Go/bin/pkg/mod/cache/download,goproxy.cn
GO := env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy go

.PHONY: generate
generate:
	@make mock
.PHONY: mock
mock:
	@$(GO) generate -tags=wireinject ./...
	@$(GO) mod tidy

.PHONY: build
build:
	@$(GO) build ./...

.PHONY: vet
vet:
	@$(GO) vet ./...

.PHONY: grpc
grpc:
	@buf generate lmbook/api/proto

.PHONY: grpc_mock
grpc_mock:
	@mockgen -source=lmbook/api/proto/gen/article/v1/article_grpc.pb.go -package=artmocks -destination=lmbook/api/proto/gen/article/v1/mocks/article_grpc.mock.go
	@mockgen -source=lmbook/api/proto/gen/intr/v1/interactive_grpc.pb.go -package=intrmocks -destination=lmbook/api/proto/gen/intr/v1/mocks/interactive_grpc.mock.go
	@mockgen -source=lmbook/api/proto/gen/payment/v1/payment_grpc.pb.go -package=pmtmocks -destination=lmbook/api/proto/gen/payment/v1/mocks/payment_grpc.mock.go
	@mockgen -source=lmbook/api/proto/gen/follow/v1/follow_grpc.pb.go -package=followmocks -destination=lmbook/api/proto/gen/follow/v1/mocks/follow_grpc.mock.go
	@mockgen -source=lmbook/api/proto/gen/account/v1/account_grpc.pb.go -package=accountmocks -destination=lmbook/api/proto/gen/account/v1/mocks/account_grpc.mock.go


.PHONY: e2e
e2e:
	@docker compose -f lmbook/docker-compose.yaml down
	@docker compose -f lmbook/docker-compose.yaml up -d
	@$(GO) test -race ./lmbook/... -tags=e2e
	@docker compose -f lmbook/docker-compose.yaml down
.PHONY: e2e_up
e2e_up:
	@docker compose -f lmbook/docker-compose.yaml up -d
.PHONY: e2e_down
e2e_down:
	@docker compose -f lmbook/docker-compose.yaml down