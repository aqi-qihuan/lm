import request from '@/utils/request'
import type { Article } from '@/types/article'

const unwrap = (response: any) => response.data.data

// ========== 创作者文章管理 ==========

/** 创作者文章列表 - POST /articles/list */
export const getArticleList = async (params: {
  author?: number
  offset: number
  limit: number
}): Promise<{ articles: Article[] }> => {
  const response = await request.post('/articles/list', params)
  return unwrap(response)
}

/** 创作者查看自己的文章详情 - GET /articles/detail/:id */
export const getArticleDetail = async (id: number): Promise<Article> => {
  const response = await request.get(`/articles/detail/${id}`)
  return unwrap(response)
}

/** 保存草稿 - POST /articles/edit */
export const saveArticle = async (article: {
  id?: number
  title: string
  content: string
}): Promise<number> => {
  const response = await request.post('/articles/edit', article)
  return unwrap(response)
}

/** 发布文章 - POST /articles/publish */
export const publishArticle = async (article: {
  id?: number
  title: string
  content: string
}): Promise<number> => {
  const response = await request.post('/articles/publish', article)
  return unwrap(response)
}

/** 撤回文章 - POST /articles/withdraw */
export const withdrawArticle = async (id: number): Promise<void> => {
  const response = await request.post('/articles/withdraw', { id })
  return unwrap(response)
}

// ========== 已发布文章（公开） ==========

/** 已发布文章详情 - GET /articles/pub/:id */
export const getPublishedArticle = async (id: number): Promise<Article> => {
  const response = await request.get(`/articles/pub/${id}`)
  return unwrap(response)
}

/** 点赞 - POST /articles/pub/like */
export const likeArticle = async (id: number, like: boolean): Promise<void> => {
  const response = await request.post('/articles/pub/like', { id, like })
  return unwrap(response)
}

/** 收藏 - POST /articles/pub/collect */
export const collectArticle = async (id: number, cid: number): Promise<void> => {
  const response = await request.post('/articles/pub/collect', { id, cid })
  return unwrap(response)
}

/** 打赏 - POST /articles/pub/reward */
export const rewardArticle = async (id: number, amt: number): Promise<{ codeURL: string; rid: number }> => {
  const response = await request.post('/articles/pub/reward', { id, amt })
  return unwrap(response)
}

// ========== 收藏夹 ==========

/** 获取收藏列表 - POST /collections/list */
export const getCollections = async (offset = 0, limit = 20) => {
  const response = await request.post('/collections/list', { offset, limit })
  return unwrap(response)
}

/** 取消收藏 - POST /collections/cancel */
export const cancelCollection = async (bizId: number) => {
  const response = await request.post('/collections/cancel', { bizId })
  return unwrap(response)
}
