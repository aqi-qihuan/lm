package dao

import (
	"context"
	_ "embed"
	"fmt"
	"github.com/elastic/go-elasticsearch/v8"
	"golang.org/x/sync/errgroup"
	"io"
	"strings"
	"time"
)

var (
	//go:embed user_index.json
	userIndex string
	//go:embed article_index.json
	articleIndex string
	//go:embed tags_index.json
	tagIndex string
)

// InitES 创建索引
func InitES(client *elasticsearch.Client) error {
	const timeout = time.Second * 10
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	var eg errgroup.Group
	eg.Go(func() error {
		return tryCreateIndex(ctx, client, UserIndexName, userIndex)
	})
	eg.Go(func() error {
		return tryCreateIndex(ctx, client, ArticleIndexName, articleIndex)
	})
	eg.Go(func() error {
		return tryCreateIndex(ctx, client, TagIndexName, articleIndex)
	})

	return eg.Wait()
}

func tryCreateIndex(ctx context.Context,
	client *elasticsearch.Client,
	idxName, idxCfg string,
) error {
	// 索引可能已经建好了
	res, err := client.Indices.Exists(
		[]string{idxName},
		client.Indices.Exists.WithContext(ctx),
	)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode == 200 {
		return nil
	}
	if res.StatusCode != 404 {
		return fmt.Errorf("检查索引 %s 存在性失败，状态码 %d", idxName, res.StatusCode)
	}
	cres, err := client.Indices.Create(
		idxName,
		client.Indices.Create.WithContext(ctx),
		client.Indices.Create.WithBody(strings.NewReader(idxCfg)),
	)
	if err != nil {
		return err
	}
	defer cres.Body.Close()
	if cres.IsError() {
		body, _ := io.ReadAll(cres.Body)
		return fmt.Errorf("创建索引 %s 失败: %s", idxName, body)
	}
	return nil
}
