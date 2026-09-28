package ioc

import (
	grpc2 "basic-go/lmbook/comment/grpc"
	"basic-go/lmbook/pkg/grpcx"
	"github.com/spf13/viper"
	"google.golang.org/grpc"
)

func InitGRPCxServer(comment *grpc2.CommentServiceServer) *grpcx.Server {
	type Config struct {
		Port int `yaml:"port"`
	}
	var cfg Config
	err := viper.UnmarshalKey("grpc", &cfg)
	if err != nil {
		panic(err)
	}
	server := grpc.NewServer()
	comment.Register(server)
	return &grpcx.Server{
		Server: server,
		Port:   cfg.Port,
	}
}
