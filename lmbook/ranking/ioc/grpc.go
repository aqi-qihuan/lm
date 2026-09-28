package ioc

import (
	"basic-go/lmbook/pkg/grpcx"
	grpc2 "basic-go/lmbook/ranking/grpc"
	"github.com/spf13/viper"
	"google.golang.org/grpc"
)

func InitGRPCxServer(rankingServer *grpc2.RankingServiceServer) *grpcx.Server {
	type Config struct {
		Port int `yaml:"port"`
	}
	var cfg Config
	err := viper.UnmarshalKey("grpc.server", &cfg)
	if err != nil {
		panic(err)
	}
	server := grpc.NewServer()
	rankingServer.Register(server)
	return &grpcx.Server{
		Server: server,
		Port:   cfg.Port,
	}
}
