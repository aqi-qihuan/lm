package dao

import (
	"context"
	"fmt"
	"strings"

	"github.com/elastic/go-elasticsearch/v8"
)

type AnyESADO struct {
	client *elasticsearch.Client
}

func NewAnyESDAO(client *elasticsearch.Client) AnyDAO {
	return &AnyESADO{client: client}
}

func (a *AnyESADO) Input(ctx context.Context, index, docId, data string) error {
	res, err := a.client.Index(
		index,
		strings.NewReader(data),
		a.client.Index.WithDocumentID(docId),
		a.client.Index.WithContext(ctx),
	)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.IsError() {
		return fmt.Errorf("写入文档失败: %s", res.String())
	}
	return nil
}
