import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Input, Spin, Pagination, message } from 'antd'
import { SearchOutlined, FireOutlined, TrophyOutlined } from '@ant-design/icons'
import ArticleCard from '@/components/ArticleCard'
import { TagPill, EmptyState } from '@/components/common'
import { getArticleList } from '@/services/articleService'
import { searchArticles, getUserTags, getInteractiveByIds, getFeedEvents } from '@/services/searchService'
import type { Article } from '@/types/article'

const { Search } = Input

interface TagItem {
  name: string
  count: number
}

/** HOK 营地风格首页 - 暗黑沉浸 + 金色荣耀 */
const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12, total: 0 })
  const [keyword, setKeyword] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [tags, setTags] = useState<TagItem[]>([])
  const [feedMode, setFeedMode] = useState(false)
  const debounceRef = useRef<number>(undefined)

  const fetchArticles = useCallback(async (page = 1, pageSize = 12, kw = '', tag = '') => {
    setLoading(true)
    try {
      const offset = (page - 1) * pageSize
      let result: { articles: any[]; total?: number }

      if (kw.trim()) {
        result = await searchArticles({ keyword: kw.trim(), offset, limit: pageSize })
      } else if (tag) {
        result = await searchArticles({ keyword: tag, offset, limit: pageSize })
      } else {
        result = await getArticleList({
          offset, limit: pageSize
        })
      }

      const arts = result.articles || []
      setArticles(arts)

      // 批量获取互动数据（点赞/收藏状态）
      if (arts.length > 0) {
        try {
          const ids = arts.map((a: any) => a.id)
          const intrData = await getInteractiveByIds('article', ids)
          if (intrData?.intrs) {
            setArticles(prev => prev.map((a: any) => ({
              ...a,
              likeCnt: intrData.intrs[a.id]?.like_cnt || a.likeCnt || 0,
              collectCnt: intrData.intrs[a.id]?.collect_cnt || a.collectCnt || 0,
              liked: intrData.intrs[a.id]?.liked || false,
              collected: intrData.intrs[a.id]?.collected || false,
            })))
          }
        } catch { /* 互动数据获取失败不影响文章展示 */ }
      }

      // 首次加载取前3篇作为热门推荐
      if (page === 1 && !kw && !tag) {
        setFeaturedArticles(arts.slice(0, 3))
      }

      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize,
        total: result.total ?? (arts.length < pageSize ? offset + arts.length : offset + pageSize + 1)
      }))
    } catch {
      message.error('加载文章失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getUserTags().then((res) => setTags(res?.tags || [])).catch(() => {})
  }, [])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const handleSearch = (value: string) => {
    setKeyword(value)
    setActiveTag('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchArticles(1, pagination.pageSize, value, '')
    }, 300)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setKeyword(value)
    setActiveTag('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchArticles(1, pagination.pageSize, value, '')
    }, 400)
  }

  const handleTagClick = (tagName: string) => {
    const newTag = tagName === activeTag ? '' : tagName
    setActiveTag(newTag)
    setKeyword('')
    fetchArticles(1, pagination.pageSize, '', newTag)
  }

  const handlePageChange = (page: number, pageSize?: number) => {
    fetchArticles(page, pageSize || pagination.pageSize, keyword, activeTag)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Feed 流加载
  const handleFeedToggle = async () => {
    if (feedMode) {
      setFeedMode(false)
      fetchArticles()
    } else {
      setFeedMode(true)
      setLoading(true)
      try {
        const res = await getFeedEvents(20)
        const events = res?.feedEvents || []
        // Feed 事件转为文章卡片格式
        setArticles(events.map((e: any) => ({
          id: e.id, title: e.content || e.type, abstract: '',
          author: { id: e.user?.id, name: '关注的人' },
          ctime: new Date(e.ctime * 1000).toISOString(),
        })))
      } catch {
        message.error('加载动态失败')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* 荣耀光晕背景 */}
      <div className="bg-glory" style={{ paddingTop: 24, paddingBottom: 12 }}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          {/* 搜索栏 */}
          <div className="flex justify-center mb-6">
            <Search
              placeholder="搜索文章、作者、标签..."
              value={keyword}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              size="large"
              allowClear
              style={{ maxWidth: 560 }}
              className="hok-search"
            />
          </div>

          {/* Feed 动态切换 */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="flex gap-1 sm:gap-2" style={{ background: 'rgba(19,21,32,0.8)', borderRadius: 12, padding: 4, border: '1px solid rgba(240,192,96,0.1)' }}>
              <button
                onClick={() => { if (feedMode) { setFeedMode(false); fetchArticles() } }}
                style={{
                  padding: '8px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  background: !feedMode ? 'linear-gradient(135deg, #F0C060 0%, #FF8C00 100%)' : 'transparent',
                  color: !feedMode ? '#0B0D17' : '#9C9688', border: 'none', cursor: 'pointer',
                  transition: 'all 200ms',
                }}
              >
                推荐
              </button>
              <button
                onClick={handleFeedToggle}
                style={{
                  padding: '8px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  background: feedMode ? 'linear-gradient(135deg, #F0C060 0%, #FF8C00 100%)' : 'transparent',
                  color: feedMode ? '#0B0D17' : '#9C9688', border: 'none', cursor: 'pointer',
                  transition: 'all 200ms',
                }}
              >
                关注动态
              </button>
            </div>
          </div>
          {!keyword && !activeTag && !feedMode && featuredArticles.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <FireOutlined style={{ color: '#F0C060', fontSize: 20 }} />
                <h2 style={{ color: '#F0C060', fontSize: 20, fontWeight: 700, margin: 0 }}>
                  热门推荐
                </h2>
                <div className="gold-line flex-1 ml-3" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {featuredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} featured />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* 标签筛选 */}
        {tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-6">
            <TrophyOutlined style={{ color: '#F0C060', marginRight: 4 }} />
            <TagPill
              active={!activeTag}
              onClick={() => { setActiveTag(''); setKeyword(''); fetchArticles(1, pagination.pageSize, '', '') }}
            >
              全部
            </TagPill>
            {tags.map((tag) => (
              <TagPill
                key={tag.name}
                active={activeTag === tag.name}
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name} ({tag.count})
              </TagPill>
            ))}
          </div>
        )}

        {/* 区块标题 */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ color: '#E8E0D0', fontSize: 22, fontWeight: 700, margin: 0 }}>
            {keyword ? `搜索: ${keyword}` : activeTag ? `标签: ${activeTag}` : '最新文章'}
          </h2>
          <span style={{ color: '#6B6558', fontSize: 13 }}>
            共 {pagination.total} 篇
          </span>
        </div>

        {/* 文章网格 */}
        {loading ? (
          <div className="loading-spinner">
            <Spin size="large" />
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mb-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* 分页 */}
            <div className="flex justify-center py-4">
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => (
                  <span style={{ color: '#6B6558' }}>共 {total} 篇文章</span>
                )}
              />
            </div>
          </>
        ) : (
          <EmptyState
            icon={<SearchOutlined />}
            title={keyword ? `未找到与 "${keyword}" 相关的文章` : activeTag ? `暂无 "${activeTag}" 标签的文章` : '暂无文章'}
            description="试试其他关键词或标签"
          />
        )}
      </div>
    </div>
  )
}

export default HomePage
