package ioc

import (
	grpc2 "basic-go/lmbook/follow/grpc"
	"basic-go/lmbook/pkg/grpcx"
	"github.com/spf13/viper"
	"google.golang.org/grpc"
)

func InitGRPCxServer(followService *grpc2.FollowServiceServer) *grpcx.Server {
	type Config struct {
		Port int `yaml:"port"`
	}
	var cfg Config
	err := viper.UnmarshalKey("grpc", &cfg)
	if err != nil {
		panic(err)
	}
	server := grpc.NewServer()
	followService.Register(server)
	return &grpcx.Server{
		Server: server,
		Port:   cfg.Port,
	}
}
