//go:build wireinject

package main

import (
	"basic-go/lmbook/ranking/grpc"
	"basic-go/lmbook/ranking/ioc"
	"basic-go/lmbook/ranking/repository"
	"basic-go/lmbook/ranking/repository/cache"
	"basic-go/lmbook/ranking/service"
	"github.com/google/wire"
)

var serviceProviderSet = wire.NewSet(
	cache.NewRankingLocalCache,
	cache.NewRedisRankingCache,
	repository.NewCachedRankingRepository,
	service.NewBatchRankingService,
)

var thirdProvider = wire.NewSet(
	ioc.InitLogger,
	ioc.InitRedis,
	ioc.InitEtcdClient,
	ioc.InitInterActiveRpcClient,
	ioc.InitArticleRpcClient,
)

func Init() *App {
	wire.Build(
		thirdProvider,
		serviceProviderSet,
		grpc.NewRankingServiceServer,
		ioc.InitGRPCxServer,
		wire.Struct(new(App), "*"),
	)
	return new(App)
}
