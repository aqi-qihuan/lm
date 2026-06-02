import React, { useState, useEffect } from 'react'
import { Modal, Button, InputNumber, message, Spin } from 'antd'
import { GiftOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { rewardArticle } from '@/services/articleService'
import { getRewardDetail } from '@/services/rewardService'

interface RewardModalProps {
  visible: boolean
  onClose: () => void
  articleId: number
  articleTitle: string
  authorName: string
}

type RewardStep = 'amount' | 'paying' | 'success' | 'failed'

/** HOK 金色风格打赏弹窗 - 金额选择 + 微信支付二维码 */
const RewardModal: React.FC<RewardModalProps> = ({
  visible, onClose, articleId, articleTitle, authorName
}) => {
  const [step, setStep] = useState<RewardStep>('amount')
  const [amount, setAmount] = useState<number>(5)
  const [codeURL, setCodeURL] = useState('')
  const [loading, setLoading] = useState(false)

  const presetAmounts = [1, 5, 10, 20, 50, 100]

  useEffect(() => {
    if (!visible) {
      setStep('amount')
      setCodeURL('')
    }
  }, [visible])

  // 发起打赏
  const handleReward = async () => {
    setLoading(true)
    try {
      const result = await rewardArticle(articleId, amount)
      setCodeURL(result.codeURL)
      setStep('paying')
      // 开始轮询打赏状态
      pollRewardStatus(result.rid)
    } catch {
      message.error('打赏失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 轮询打赏状态
  const pollRewardStatus = async (rewardId: number) => {
    const maxAttempts = 60 // 最多轮询60次（5分钟）
    let attempts = 0
    const timer = setInterval(async () => {
      attempts++
      if (attempts > maxAttempts) {
        clearInterval(timer)
        setStep('failed')
        return
      }
      try {
        const result = await getRewardDetail(rewardId)
        if (result.status === 'RewardStatusPayed') {
          clearInterval(timer)
          setStep('success')
        } else if (result.status === 'RewardStatusFailed') {
          clearInterval(timer)
          setStep('failed')
        }
      } catch {
        // 忽略轮询错误
      }
    }, 5000)
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={420}
      centered
      styles={{
        root: {
          background: '#0B0D17',
          border: '1px solid rgba(240, 192, 96, 0.4)',
          borderRadius: 16,
          boxShadow: '0 0 30px rgba(240, 192, 96, 0.3)',
        },
        header: {
          background: 'transparent',
          borderBottom: '1px solid rgba(240, 192, 96, 0.2)',
        },
      }}
      title={
        <div className="flex items-center gap-2">
          <GiftOutlined style={{ color: '#F0C060', fontSize: 20 }} />
          <span style={{ color: '#F0C060', fontWeight: 700 }}>打赏作者</span>
        </div>
      }
    >
      {step === 'amount' && (
        <div style={{ padding: '8px 0' }}>
          <p style={{ color: '#9C9688', fontSize: 14, marginBottom: 16 }}>
            为「<span style={{ color: '#F5F0E8' }}>{articleTitle}</span>」的作者
            <span style={{ color: '#F0C060' }}> {authorName} </span>
            打赏
          </p>

          {/* 预设金额 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {presetAmounts.map((amt) => (
              <Button
                key={amt}
                onClick={() => setAmount(amt)}
                style={{
                  background: amount === amt
                    ? 'linear-gradient(135deg, #F0C060 0%, #C8982A 100%)'
                    : 'rgba(19, 21, 32, 0.8)',
                  border: amount === amt
                    ? '1px solid #9C9688'
                    : '1px solid rgba(240, 192, 96, 0.3)',
                  color: amount === amt ? '#0B0D17' : '#F5F0E8',
                  fontWeight: amount === amt ? 700 : 400,
                  borderRadius: 10,
                }}
              >
                ¥{amt}
              </Button>
            ))}
          </div>

          {/* 自定义金额 */}
          <div className="mb-6">
            <span style={{ color: '#9C9688', fontSize: 13, marginBottom: 8, display: 'block' }}>
              自定义金额
            </span>
            <InputNumber
              value={amount}
              onChange={(v) => setAmount(v || 1)}
              min={1}
              max={10000}
              prefix="¥"
              style={{
                width: '100%',
                background: 'rgba(19, 21, 32, 0.8)',
                border: '1px solid rgba(240, 192, 96, 0.3)',
                borderRadius: 10,
              }}
            />
          </div>

          <Button
            block
            size="large"
            loading={loading}
            onClick={handleReward}
            style={{
              background: 'linear-gradient(135deg, #F0C060 0%, #FF8C00 100%)',
              border: 'none',
              borderRadius: 10,
              height: 48,
              fontSize: 16,
              fontWeight: 700,
              color: '#0B0D17',
              boxShadow: '0 0 20px rgba(240, 192, 96, 0.3)',
            }}
          >
            打赏 ¥{amount}
          </Button>
        </div>
      )}

      {step === 'paying' && (
        <div className="text-center" style={{ padding: '24px 0' }}>
          <p style={{ color: '#F5F0E8', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            请使用微信扫码支付
          </p>
          {codeURL ? (
            <div style={{
              background: '#fff',
              borderRadius: 10,
              padding: 20,
              display: 'inline-block',
              marginBottom: 16,
              border: '2px solid rgba(240, 192, 96, 0.5)',
              boxShadow: '0 0 20px rgba(240, 192, 96, 0.3)',
            }}>
              <img
                src={codeURL}
                alt="微信支付二维码"
                style={{ width: 200, height: 200, display: 'block' }}
              />
            </div>
          ) : (
            <Spin size="large" style={{ margin: '24px 0' }} />
          )}
          <p style={{ color: '#9C9688', fontSize: 13 }}>
            支付金额：<span style={{ color: '#F0C060', fontWeight: 700 }}>¥{amount}</span>
          </p>
          <p style={{ color: '#6B6558', fontSize: 12, marginTop: 8 }}>
            <LoadingOutlined style={{ marginRight: 4 }} />
            等待支付确认...
          </p>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center" style={{ padding: '32px 0' }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: '#F0C060', marginBottom: 16 }} />
          <p style={{ color: '#F5F0E8', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            打赏成功！
          </p>
          <p style={{ color: '#9C9688', fontSize: 14, marginBottom: 24 }}>
            感谢你对 <span style={{ color: '#F0C060' }}>{authorName}</span> 的支持
          </p>
          <Button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(240, 192, 96, 0.3)',
              color: '#F0C060',
              borderRadius: 10,
              height: 40,
            }}
          >
            关闭
          </Button>
        </div>
      )}

      {step === 'failed' && (
        <div className="text-center" style={{ padding: '32px 0' }}>
          <p style={{ color: '#EF4444', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            支付超时或失败
          </p>
          <Button
            onClick={() => setStep('amount')}
            style={{
              background: 'linear-gradient(135deg, #F0C060 0%, #C8982A 100%)',
              border: '1px solid #9C9688',
              borderRadius: 10,
              color: '#0B0D17',
              fontWeight: 700,
            }}
          >
            重新打赏
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default RewardModal
