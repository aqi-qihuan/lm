package service

import (
	"basic-go/lmbook/feed/domain"
	"basic-go/lmbook/feed/repository"
	"context"
	"time"
)

const (
	LikeEventName = "like_event"
)

type LikeEventHandler struct {
	repo repository.FeedEventRepo
}

func NewLikeEventHandler(repo repository.FeedEventRepo) Handler {
	return &LikeEventHandler{
		repo: repo,
	}
}

func (f *LikeEventHandler) FindFeedEvents(ctx context.Context, uid, timestamp, limit int64) ([]domain.FeedEvent, error) {
	return f.repo.FindPushEventsWithTyp(ctx, LikeEventName, uid, timestamp, limit)
}

// CreateFeedEvent 创建跟随方式
// 如果 A 关注了 B，那么
// follower 就是 A
// followee 就是 B
func (f *LikeEventHandler) CreateFeedEvent(ctx context.Context, evt domain.FeedEvent) error {
	ext := evt.Ext
	followee, err := ext.Get("followee").AsInt64()
	if err != nil {
		return err
	}
	return f.repo.CreatePushEvents(ctx, []domain.FeedEvent{{
		Uid:   followee,
		Type:  LikeEventName,
		Ctime: time.Now(),
		Ext:   ext,
	}})
}
