package dao

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	"github.com/elastic/go-elasticsearch/v8"
)

type TagESDAO struct {
	client *elasticsearch.Client
}

func NewTagESDAO(client *elasticsearch.Client) TagDAO {
	return &TagESDAO{client: client}
}

func (t *TagESDAO) Search(ctx context.Context, uid int64, biz string, keywords []string) ([]int64, error) {
	// 等价 olivere: Bool(Must(Term(uid), Term(biz), Terms(tags from strings)))
	query := map[string]any{
		"bool": map[string]any{
			"must": []any{
				// 必须是我打的标签
				map[string]any{
					"term": map[string]any{"uid": uid},
				},
				map[string]any{
					"term": map[string]any{"biz": biz},
				},
				map[string]any{
					"terms": map[string]any{"tags": keywords},
				},
			},
		},
	}
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(query); err != nil {
		return nil, err
	}
	res, err := t.client.Search(
		t.client.Search.WithContext(ctx),
		t.client.Search.WithIndex(TagIndexName),
		t.client.Search.WithBody(&buf),
	)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.IsError() {
		return nil, fmt.Errorf("搜索标签失败: %s", res.String())
	}
	var result searchHits
	if err = json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, err
	}
	resp := make([]int64, 0, len(result.Hits))
	for _, hit := range result.Hits {
		var bt BizTags
		err = json.Unmarshal(hit.Source, &bt)
		if err != nil {
			return nil, err
		}
		resp = append(resp, bt.BizId)
	}
	return resp, nil
}

type BizTags struct {
	Uid   int64    `json:"uid"`
	Biz   string   `json:"biz"`
	BizId int64    `json:"biz_id"`
	Tags  []string `json:"tags"`
}
