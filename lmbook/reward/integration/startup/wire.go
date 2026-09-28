//go:build wireinject

package startup

import (
	accountv1 "basic-go/lmbook/api/proto/gen/account/v1"
	pmtv1 "basic-go/lmbook/api/proto/gen/payment/v1"
	"basic-go/lmbook/reward/repository"
	"basic-go/lmbook/reward/repository/cache"
	"basic-go/lmbook/reward/repository/dao"
	"basic-go/lmbook/reward/service"
	"github.com/google/wire"
)

var thirdPartySet = wire.NewSet(InitTestDB, InitLogger, InitRedis)

func InitWechatNativeSvc(client pmtv1.WechatPaymentServiceClient,
	acli accountv1.AccountServiceClient) service.RewardService {
	wire.Build(service.NewWechatNativeRewardService,
		thirdPartySet,
		cache.NewRewardRedisCache,
		repository.NewRewardRepository, dao.NewRewardGORMDAO)
	return nil
}
