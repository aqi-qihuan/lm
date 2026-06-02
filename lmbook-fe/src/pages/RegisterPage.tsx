import React, { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, SendOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { register, sendSmsCode } from '@/services/userService'

/** HOK 营地风格注册页 */
const RegisterPage: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()

  const handleRegister = async (values: { email: string; password: string; nickname: string }) => {
    setLoading(true)
    try {
      await register({ email: values.email, password: values.password, confirmPassword: values.password })
      message.success('注册成功！请登录')
      navigate('/login')
    } catch (error: any) {
      message.error(error.message || '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSendCaptcha = async () => {
    const email = form.getFieldValue('email')
    if (!email) { message.warning('请先输入邮箱'); return }
    setCaptchaLoading(true)
    try {
      await sendSmsCode(email)
      message.success('验证码已发送')
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0 }
          return prev - 1
        })
      }, 1000)
    } catch {
      message.error('发送失败，请重试')
    } finally {
      setCaptchaLoading(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center px-3 sm:px-4 py-8"
      style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}
    >
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '50vh',
        background: 'radial-gradient(circle at 50% 30%, rgba(240,192,96,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div className="w-full max-w-md" style={{ position: 'relative', zIndex: 1 }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-4xl" style={{
            fontWeight: 800, color: '#F0C060', margin: '0 0 8px 0',
            textShadow: '0 0 30px rgba(240, 192, 96, 0.3)',
          }}>
            蓝梦社区
          </h1>
          <p className="text-sm sm:text-base" style={{ color: '#9C9688' }}>创建你的账号</p>
        </div>

        <div className="glass-card p-4 sm:p-8" style={{ cursor: 'default' }}>
          <Form form={form} name="register" onFinish={handleRegister} layout="vertical" size="large">
            <Form.Item name="nickname" rules={[{ required: true, message: '请输入昵称' }]}>
              <Input
                prefix={<UserOutlined style={{ color: '#6B6558' }} />}
                placeholder="昵称"
                style={{
                  background: 'rgba(26, 29, 43, 0.8)', border: '1px solid rgba(240, 192, 96, 0.1)',
                  borderRadius: 12, height: 48,
                }}
              />
            </Form.Item>

            <Form.Item name="email" rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}>
              <Input
                prefix={<MailOutlined style={{ color: '#6B6558' }} />}
                placeholder="邮箱"
                style={{
                  background: 'rgba(26, 29, 43, 0.8)', border: '1px solid rgba(240, 192, 96, 0.1)',
                  borderRadius: 12, height: 48,
                }}
              />
            </Form.Item>

            <Form.Item>
              <div className="flex gap-3">
                <Form.Item name="captcha" noStyle>
                  <Input
                    placeholder="验证码"
                    style={{
                      background: 'rgba(26, 29, 43, 0.8)', border: '1px solid rgba(240, 192, 96, 0.1)',
                      borderRadius: 12, height: 48, flex: 1,
                    }}
                  />
                </Form.Item>
                <Button
                  icon={<SendOutlined />}
                  loading={captchaLoading}
                  disabled={countdown > 0}
                  onClick={handleSendCaptcha}
                  style={{
                    height: 48, borderRadius: 12,
                    background: 'transparent',
                    border: '1px solid rgba(240, 192, 96, 0.3)',
                    color: '#F0C060',
                  }}
                >
                  {countdown > 0 ? `${countdown}s` : '发送'}
                </Button>
              </div>
            </Form.Item>

            <Form.Item name="password" rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少8位' },
            ]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#6B6558' }} />}
                placeholder="密码（至少8位，含数字+特殊字符）"
                style={{
                  background: 'rgba(26, 29, 43, 0.8)', border: '1px solid rgba(240, 192, 96, 0.1)',
                  borderRadius: 12, height: 48,
                }}
              />
            </Form.Item>

            <Form.Item name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve()
                    return Promise.reject(new Error('两次密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#6B6558' }} />}
                placeholder="确认密码"
                style={{
                  background: 'rgba(26, 29, 43, 0.8)', border: '1px solid rgba(240, 192, 96, 0.1)',
                  borderRadius: 12, height: 48,
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  background: 'linear-gradient(135deg, #F0C060 0%, #FF8C00 100%)',
                  border: 'none', borderRadius: 12, height: 48,
                  fontSize: 16, fontWeight: 700, color: '#0B0D17',
                  boxShadow: '0 4px 16px rgba(240, 192, 96, 0.3)',
                }}
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center">
            <span style={{ color: '#6B6558' }}>已有账号？</span>
            <Link to="/login" style={{ color: '#F0C060', fontWeight: 600, marginLeft: 6 }}>
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
