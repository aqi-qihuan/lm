import React, { useState, useEffect } from 'react'
import { Input, Spin, Avatar, message } from 'antd'
import { SearchOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { search } from '@/services/searchService'
import ArticleCard from '@/components/ArticleCard'
import { GlassCard, EmptyState } from '@/components/common'
import type { Article } from '@/types/article'

/** HOK 风格搜索结果页 - 同时展示用户和文章 */
const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('q') || '')
  const [articles, setArticles] = useState<Article[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setKeyword(q)
      doSearch(q)
    }
  }, [searchParams])

  const doSearch = async (kw: string) => {
    if (!kw.trim()) return
    setLoading(true)
    try {
      const result = await search(kw)
      setArticles(result?.article?.articles || [])
      setUsers(result?.user?.users || [])
    } catch {
      message.error('搜索失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setKeyword(value)
    setSearchParams({ q: value })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <div className="bg-glory" style={{ paddingTop: 32, paddingBottom: 16 }}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <Input.Search
            placeholder="搜索文章、作者..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
            size="large"
            allowClear
            className="max-w-xl"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {loading ? (
          <div className="loading-spinner"><Spin size="large" /></div>
        ) : (
          <>
            {/* 用户结果 */}
            {users.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <UserOutlined style={{ color: '#F0C060', fontSize: 18 }} />
                  <h2 className="text-base sm:text-lg" style={{ color: '#E8E0D0', fontWeight: 700, margin: 0 }}>
                    用户 ({users.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {users.map((u) => (
                    <GlassCard key={u.id} onClick={() => navigate(`/profile/${u.id}`)} style={{ padding: '14px 18px' }}>
                      <div className="flex items-center gap-3">
                        <Avatar
                          size={40}
                          src={u.avatar}
                          icon={<UserOutlined />}
                          style={{ border: '2px solid rgba(240,192,96,0.2)', background: 'rgba(240,192,96,0.1)' }}
                        />
                        <div>
                          <div style={{ color: '#F5F0E8', fontWeight: 600 }}>{u.nickname || u.email}</div>
                          <div style={{ color: '#6B6558', fontSize: 13 }}>@{u.email?.split('@')[0]}</div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* 文章结果 */}
            {articles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileTextOutlined style={{ color: '#F0C060', fontSize: 18 }} />
                  <h2 className="text-base sm:text-lg" style={{ color: '#E8E0D0', fontWeight: 700, margin: 0 }}>
                    文章 ({articles.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}

            {users.length === 0 && articles.length === 0 && keyword && (
              <EmptyState
                icon={<SearchOutlined />}
                title={`未找到与 "${keyword}" 相关的结果`}
                description="试试其他关键词"
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPage
