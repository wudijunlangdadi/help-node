import api from './api'
import type { Article, PracticeMode, ApiResponse } from '../types'

export const articleService = {
  async getArticles(mode?: PracticeMode): Promise<Article[]> {
    const params = mode ? { mode } : {}
    const res = await api.get<ApiResponse<Article[]>>('/articles', { params })
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error || '获取文章失败')
    }
    return res.data.data
  },

  async getArticle(id: string): Promise<Article> {
    const res = await api.get<ApiResponse<Article>>(`/articles/${id}`)
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error || '获取文章失败')
    }
    return res.data.data
  },
}
