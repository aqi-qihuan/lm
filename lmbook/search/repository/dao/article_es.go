package dao

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/ecodeclub/ekit/slice"
)

const ArticleIndexName = "article_index"
const TagIndexName = "tags_index"

type Article struct {
	Id      int64    `json:"id"`
	Title   string   `json:"title"`
	Status  int32    `json:"status"`
	Content string   `json:"content"`
	Tags    []string `json:"tags"`
}

type ArticleElasticDAO struct {
	client *elasticsearch.Client
}

func NewArticleElasticDAO(client *elasticsearch.Client) ArticleDAO {
	return &ArticleElasticDAO{client: client}
}

// searchResult 仅解析需要的 hits 部分
type searchHits struct {
	Hits []struct {
		Source json.RawMessage `json:"_source"`
	} `json:"hits"`
}

func (h *ArticleElasticDAO) Search(ctx context.Context, tagArtIds []int64, keywords []string) ([]Article, error) {
	queryString := joinKeywords(keywords)
	ids := slice.Map(tagArtIds, func(idx int, src int64) any {
		return src
	})
	// 等价 olivere: Bool(Must(Bool(Should(Terms(id, ids...).Boost(2), Match(title), Match(content))), Term(status, 2)))
	query := map[string]any{
		"bool": map[string]any{
			"must": []any{
				map[string]any{
					"bool": map[string]any{
						"should": []any{
							// 给予更高权重
							map[string]any{
								"terms": map[string]any{
									"id":    ids,
									"boost": 2,
								},
							},
							map[string]any{
								"match": map[string]any{"title": queryString},
							},
							map[string]any{
								"match": map[string]any{"content": queryString},
							},
						},
					},
				},
				map[string]any{
					"term": map[string]any{"status": 2},
				},
			},
		},
	}
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(query); err != nil {
		return nil, err
	}
	res, err := h.client.Search(
		h.client.Search.WithContext(ctx),
		h.client.Search.WithIndex(ArticleIndexName),
		h.client.Search.WithBody(&buf),
	)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.IsError() {
		return nil, fmt.Errorf("搜索失败: %s", res.String())
	}
	var result searchHits
	if err = json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, err
	}
	resp := make([]Article, 0, len(result.Hits))
	for _, hit := range result.Hits {
		var ele Article
		err = json.Unmarshal(hit.Source, &ele)
		if err != nil {
			return nil, err
		}
		resp = append(resp, ele)
	}
	return resp, nil
}

func NewArticleRepository(client *elasticsearch.Client) ArticleDAO {
	return &ArticleElasticDAO{
		client: client,
	}
}

func (h *ArticleElasticDAO) InputArticle(ctx context.Context, art Article) error {
	body, err := json.Marshal(art)
	if err != nil {
		return err
	}
	res, err := h.client.Index(
		ArticleIndexName,
		bytes.NewReader(body),
		h.client.Index.WithDocumentID(strconv.FormatInt(art.Id, 10)),
		h.client.Index.WithContext(ctx),
	)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.IsError() {
		return fmt.Errorf("写入文章失败: %s", res.String())
	}
	return nil
}

func joinKeywords(keywords []string) string {
	buf := ""
	for i, kw := range keywords {
		if i > 0 {
			buf += " "
		}
		buf += kw
	}
	return buf
}
