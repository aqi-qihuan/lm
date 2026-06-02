import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * HOK 金色风格错误边界组件
 * 捕获子组件的 JavaScript 错误，显示友好的错误页面
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            {/* 故障效果标题 */}
            <h1
              className="text-6xl font-bold mb-4 glitch"
              data-text="ERROR"
              style={{
                color: '#F0C060',
                textShadow: '0 0 20px rgba(240, 192, 96, 0.5)',
              }}
            >
              ERROR
            </h1>

            {/* 错误信息 */}
            <div
              className="p-6 mb-6"
              style={{
                background: 'rgba(19, 21, 32, 0.9)',
                border: '1px solid rgba(240, 192, 96, 0.3)',
                borderRadius: 16,
              }}
            >
              <p
                className="text-lg mb-2"
                style={{ color: '#F5F0E8' }}
              >
                系统遇到异常
              </p>
              <p
                className="text-sm"
                style={{ color: '#9C9688' }}
              >
                {this.state.error?.message || '未知错误'}
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                style={{
                  background: 'linear-gradient(135deg, #F0C060 0%, #C8982A 100%)',
                  border: '1px solid #9C9688',
                  borderRadius: 10,
                  padding: '10px 24px',
                  color: '#0B0D17',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                重试
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(240, 192, 96, 0.3)',
                  borderRadius: 10,
                  padding: '10px 24px',
                  color: '#F0C060',
                  cursor: 'pointer',
                }}
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
