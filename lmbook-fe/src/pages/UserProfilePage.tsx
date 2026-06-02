import React, { useState, useEffect, useCallback } from 'react'
import { Tabs, Avatar, Button, Spin, message } from 'antd'
import { UserOutlined, SettingOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserProfile } from '@/services/userService'
import { getArticleList } from '@/services/articleService'
import { followUser, unfollowUser } from '@/services/socialService'
import { useUserStore } from '@/store/userStore'
import ArticleCard from '@/components/ArticleCard'
import { EmptyState } from '@/components/common'
import type { User } from '@/types/user'
import type { Article } from '@/types/article'

/** HOK 营地风格用户主页 */
const UserProfilePage: React.FC = () => {
  const { uid } = useParams<{ uid: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState<Article[]>([])
  const [articlesLoading, setArticlesLoading] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const { user: currentUser, isLogin } = useUserStore()
  const navigate = useNavigate()

  const profileUserId = uid ? Number(uid) : undefined
  const isOwnProfile = !uid || (currentUser && currentUser.id === Number(uid))

  const fetchUserInfo = useCallback(async () => {
    setLoading(true)
    try {
      const userId = uid ? Number(uid) : currentUser?.id
      if (!userId) { message.error('用户ID不存在'); navigate('/login'); return }
      const userInfo = await getUserProfile()
      setUser(userInfo)
    } catch {
      message.error('获取用户信息失败')
    } finally {
      setLoading(false)
    }
  }, [uid, currentUser, navigate])

  const fetchUserArticles = useCallback(async () => {
    const userId = uid ? Number(uid) : currentUser?.id
    if (!userId) return
    setArticlesLoading(true)
    try {
      const result = await getArticleList({ author: userId, offset: 0, limit: 50 })
      setArticles(result.articles)
    } catch {} finally { setArticlesLoading(false) }
  }, [uid, currentUser])

  useEffect(() => {
    fetchUserInfo()
    if (uid || currentUser?.id) fetchUserArticles()
  }, [uid])

  const handleFollowToggle = async () => {
    if (!isLogin) { message.warning('请先登录'); navigate('/login'); return }
    if (!profileUserId) return
    setFollowLoading(true)
    try {
      if (following) {
        await unfollowUser(profileUserId); setFollowing(false)
        setUser(prev => prev ? { ...prev, followerCount: (prev.followerCount || 1) - 1 } : prev)
        message.success('已取消关注')
      } else {
        await followUser(profileUserId); setFollowing(true)
        setUser(prev => prev ? { ...prev, followerCount: (prev.followerCount || 0) + 1 } : prev)
        message.success('关注成功')
      }
    } catch { message.error('操作失败') } finally { setFollowLoading(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center" style={{ minHeight: '60vh', background: 'var(--bg-deep)' }}><Spin size="large" /></div>
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh', background: 'var(--bg-deep)' }}>
        <EmptyState title="用户不存在" action={<Button onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg, #F0C060 0%, #FF8C00 100%)', border: 'none', color: '#0B0D17', fontWeight: 700, borderRadius: 10 }}>返回首页</Button>} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* 用户头部 */}
      <div className="p-4 sm:p-6" style={{
        background: 'linear-gradient(135deg, rgba(240,192,96,0.12) 0%, rgba(11,13,23,0.95) 100%)',
        borderBottom: '1px solid rgba(240, 192, 96, 0.08)',
      }}>
        <div className="max-w-4xl mx-auto flex items-center gap-4 sm:gap-8 flex-wrap">
          <Avatar
            size={80}
            src={user.avatar}
            icon={<UserOutlined />}
            style={{
              border: '3px solid rgba(240, 192, 96, 0.3)',
              background: 'rgba(240, 192, 96, 0.1)',
              boxShadow: '0 0 30px rgba(240, 192, 96, 0.15)',
              flexShrink: 0,
            }}
          />
          <div className="flex-1 min-w-0">
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F5F0E8', margin: '0 0 4px 0' }}>
              {user.nickname || user.email}
            </h1>
            <p style={{ color: '#9C9688', fontSize: 14, margin: '0 0 16px 0' }}>
              @{user.email?.split('@')[0]}
            </p>
            {user.bio && <p style={{ color: '#9C9688', fontSize: 14, margin: '0 0 16px 0' }}>{user.bio}</p>}

            <div className="flex gap-8">
              {[
                { label: '文章', value: user.articleCount || 0 },
                { label: '粉丝', value: user.followerCount || 0 },
                { label: '关注', value: user.followingCount || 0 },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#F0C060' }}>{item.value}</div>
                  <div style={{ fontSize: 13, color: '#6B6558' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0">
            {isOwnProfile ? (
              <Button
                icon={<SettingOutlined />}
                onClick={() => navigate('/settings')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(240, 192, 96, 0.3)',
                  color: '#F0C060', borderRadius: 10, height: 44,
                }}
              >
                编辑资料
              </Button>
            ) : (
              <Button
                icon={following ? <MinusOutlined /> : <PlusOutlined />}
                loading={followLoading}
                onClick={handleFollowToggle}
                style={{
                  background: following
                    ? 'rgba(240, 192, 96, 0.1)'
                    : 'linear-gradient(135deg, #F0C060 0%, #FF8C00 100%)',
                  border: following ? '1px solid rgba(240, 192, 96, 0.3)' : 'none',
                  color: following ? '#F0C060' : '#0B0D17',
                  fontWeight: 700, borderRadius: 10, height: 44,
                }}
              >
                {following ? '已关注' : '关注'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs
          defaultActiveKey="articles"
          items={[
            {
              key: 'articles',
              label: `文章 (${articles.length})`,
              children: articlesLoading ? (
                <div className="loading-spinner"><Spin size="large" /></div>
              ) : articles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {articles.map(article => <ArticleCard key={article.id} article={article} />)}
                </div>
              ) : (
                <EmptyState title="暂无文章" description="还没有发布过文章" />
              ),
            },
            {
              key: 'likes',
              label: '点赞',
              children: <EmptyState title="暂无点赞" />,
            },
            {
              key: 'favorites',
              label: '收藏',
              children: <EmptyState title="暂无收藏" />,
            },
          ]}
        />
      </div>
    </div>
  )
}

export default UserProfilePage
