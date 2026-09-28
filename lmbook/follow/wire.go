//go:build wireinject

package main

import (
	grpc2 "basic-go/lmbook/follow/grpc"
	"basic-go/lmbook/follow/ioc"
	"basic-go/lmbook/follow/repository"
	"basic-go/lmbook/follow/repository/cache"
	"basic-go/lmbook/follow/repository/dao"
	"basic-go/lmbook/follow/service"
	"github.com/google/wire"
)

var serviceProviderSet = wire.NewSet(
	dao.NewGORMFollowRelationDAO,
	repository.NewFollowRelationRepository,
	service.NewFollowRelationService,
	grpc2.NewFollowRelationServiceServer,
)

var thirdProvider = wire.NewSet(
	ioc.InitDB,
	ioc.InitLogger,
	ioc.InitRedis,
	cache.NewRedisFollowCache,
)

func Init() *App {
	wire.Build(
		thirdProvider,
		serviceProviderSet,
		ioc.InitGRPCxServer,
		wire.Struct(new(App), "*"),
	)
	return new(App)
}
