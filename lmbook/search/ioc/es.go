package ioc

import (
	"basic-go/lmbook/search/repository/dao"
	"fmt"
	"github.com/elastic/go-elasticsearch/v8"
	"github.com/spf13/viper"
)

// InitESClient 读取配置文件，进行初始化ES客户端
func InitESClient() *elasticsearch.Client {
	type Config struct {
		Url   string `yaml:"url"`
		Sniff bool   `yaml:"sniff"`
	}
	var cfg Config
	err := viper.UnmarshalKey("es", &cfg)
	if err != nil {
		panic(fmt.Errorf("读取 ES 配置失败 %w", err))
	}
	client, err := elasticsearch.NewClient(elasticsearch.Config{
		Addresses: []string{cfg.Url},
	})
	if err != nil {
		panic(err)
	}
	err = dao.InitES(client)
	if err != nil {
		panic(err)
	}
	return client
}
