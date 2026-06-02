import React, { useEffect, useState } from 'react'
import { Spin, Segmented, Avatar, Empty } from 'antd'
import { FireOutlined, EyeOutlined, LikeOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { getHotArticles } from '@/services/searchService'
import { GlassCard, RankBadge, TagPill } from '@/components/common'
import dayjs from 'dayjs'

interface HotArticle {
  id: number; title: string; abstract?: string
  author: { id: number; name: string; avatar?: string }
  ctime: string; viewCount?: number; likeCount?: number; tags?: string[]
}

type Period = 'day' | 'week' | 'month'

/** HOK 营地风格排行榜 - 金色荣耀 + 竞技氛围 */
const LeaderboardPage: React.FC = () => {
  const [articles, setArticles] = useState<HotArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('day')
  const navigate = useNavigate()

  useEffect(() => {
    fetchHotArticles(period)
  }, [period])

  const fetchHotArticles = async (_p: Period) => {
    setLoading(true)
    try {
      const result = await getHotArticles({ limit: 20 })
      setArticles(result.articles || [])
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* 荣耀光晕顶部 */}
      <div className="bg-glory" style={{ paddingTop: 48, paddingBottom: 32 }}>
        <div className="max-w-3xl mx-auto px-3 sm:px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <FireOutlined style={{ color: '#F0C060', fontSize: 32 }} />
            <h1 style={{
              fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 800,
              color: '#F0C060',
              margin: 0,
              textShadow: '0 0 20px rgba(240, 192, 96, 0.3)',
            }}>
              文章排行榜
            </h1>
          </div>
          <p className="text-sm sm:text-base" style={{ color: '#9C9688', marginBottom: 32 }}>
            发现最受欢迎的热门文章
          </p>

          {/* 时间切换 */}
          <Segmented
            value={period}
            onChange={(val) => setPeriod(val as Period)}
            options={[
              { value: 'day', label: '日榜' },
              { value: 'week', label: '周榜' },
              { value: 'month', label: '月榜' },
            ]}
            size="large"
            style={{
              background: 'rgba(19, 21, 32, 0.8)',
              border: '1px solid rgba(240, 192, 96, 0.15)',
            }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {loading ? (
          <div className="loading-spinner"><Spin size="large" /></div>
        ) : articles.length > 0 ? (
          <div className="flex flex-col gap-4">
            {articles.map((article, index) => (
              <GlassCard
                key={article.id}
                gold={index < 3}
                onClick={() => navigate(`/article/${article.id}`)}
              >
                <div className="flex items-center gap-4 p-3 sm:p-4">
                  {/* 排名 */}
                  <RankBadge rank={index + 1} size="lg" />

                  {/* 文章信息 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg" style={{
                      fontWeight: 700, color: '#F5F0E8',
                      margin: '0 0 8px 0',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      <Link
                        to={`/article/${article.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {article.title}
                      </Link>
                    </h3>

                    <div className="flex items-center gap-4 flex-wrap" style={{ fontSize: 13, color: '#9C9688' }}>
                      <span className="flex items-center gap-1">
                        <Avatar
                          size={20}
                          src={article.author?.avatar}
                          icon={<UserOutlined />}
                          style={{ background: 'rgba(240, 192, 96, 0.15)' }}
                        />
                        {article.author?.name}
                      </span>

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex gap-1">
                          {article.tags.slice(0, 2).map((tag) => (
                            <TagPill key={tag} tech>{tag}</TagPill>
                          ))}
                        </div>
                      )}

                      <span className="flex items-center gap-1">
                        <EyeOutlined /> {article.viewCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <LikeOutlined /> {article.likeCount || 0}
                      </span>
                      <span style={{ color: '#6B6558' }}>
                        {dayjs(article.ctime).format('MM-DD')}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <Empty description="暂无排行榜数据" style={{ color: '#6B6558' }} />
        )}
      </div>
    </div>
  )
}

export default LeaderboardPage
