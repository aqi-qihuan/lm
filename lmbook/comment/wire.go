//go:build wireinject

package main

import (
	grpc2 "basic-go/lmbook/comment/grpc"
	"basic-go/lmbook/comment/ioc"
	"basic-go/lmbook/comment/repository"
	"basic-go/lmbook/comment/repository/dao"
	"basic-go/lmbook/comment/service"
	"github.com/google/wire"
)

var serviceProviderSet = wire.NewSet(
	dao.NewCommentDAO,
	repository.NewCommentRepo,
	service.NewCommentSvc,
	grpc2.NewGrpcServer,
)

var thirdProvider = wire.NewSet(
	ioc.InitLogger,
	ioc.InitDB,
	ioc.InitEtcdClient,
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
