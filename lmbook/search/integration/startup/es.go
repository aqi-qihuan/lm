package startup

import (
	"basic-go/lmbook/search/repository/dao"
	"github.com/elastic/go-elasticsearch/v8"
)

func InitESClient() *elasticsearch.Client {
	client, err := elasticsearch.NewClient(elasticsearch.Config{
		Addresses: []string{"http://localhost:9200"},
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
