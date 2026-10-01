package dao

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/elastic/go-elasticsearch/v8"
)

const UserIndexName = "user_index"

type User struct {
	Id       int64  `json:"id"`
	Email    string `json:"email"`
	Nickname string `json:"nickname"`
	Phone    string `json:"phone"`
}

type UserElasticDAO struct {
	client *elasticsearch.Client
}

func (h *UserElasticDAO) Search(ctx context.Context, keywords []string) ([]User, error) {
	// 假定上面传入的 keywords 是经过了处理的
	queryString := strings.Join(keywords, " ")
	// 等价 olivere: Bool(Must(Match(nickname, queryString)))
	query := map[string]any{
		"bool": map[string]any{
			"must": []any{
				map[string]any{
					"match": map[string]any{"nickname": queryString},
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
		h.client.Search.WithIndex(UserIndexName),
		h.client.Search.WithBody(&buf),
	)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.IsError() {
		return nil, fmt.Errorf("搜索用户失败: %s", res.String())
	}
	var result searchHits
	if err = json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, err
	}
	resp := make([]User, 0, len(result.Hits))
	for _, hit := range result.Hits {
		var ele User
		err = json.Unmarshal(hit.Source, &ele)
		if err != nil {
			return nil, err
		}
		resp = append(resp, ele)
	}
	return resp, nil
}

func (h *UserElasticDAO) InputUser(ctx context.Context, user User) error {
	body, err := json.Marshal(user)
	if err != nil {
		return err
	}
	res, err := h.client.Index(
		UserIndexName,
		bytes.NewReader(body),
		h.client.Index.WithDocumentID(strconv.FormatInt(user.Id, 10)),
		h.client.Index.WithContext(ctx),
	)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.IsError() {
		return fmt.Errorf("写入用户失败: %s", res.String())
	}
	return nil
}

func NewUserElasticDAO(client *elasticsearch.Client) UserDAO {
	return &UserElasticDAO{
		client: client,
	}
}
