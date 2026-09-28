package grpc

import (
	articlev1 "basic-go/lmbook/api/proto/gen/article/v1"
	"basic-go/lmbook/article/service"
	"google.golang.org/grpc"
)

type ArticleServiceServer struct {
	articlev1.UnimplementedArticleServiceServer
	service service.ArticleService
}

func NewArticleServiceServer(svc service.ArticleService) *ArticleServiceServer {
	return &ArticleServiceServer{
		service: svc,
	}
}

func (s *ArticleServiceServer) Register(server grpc.ServiceRegistrar) {
	articlev1.RegisterArticleServiceServer(server, s)
}
