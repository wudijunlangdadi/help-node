import api from './api'
import type { DashboardStats, SavePracticeRequest, PracticeRecord, ApiResponse, PracticeMode } from '../types'

const LOCAL_HISTORY_KEY = 'typeflow-local-history'

interface LocalHistoryEntry {
  articleId: string | null
  articleTitle: string
  mode: PracticeMode
  wpm: number
  accuracy: number
  errorCount: number
  duration: number
  createdAt: string
}

export const statsService = {
  async savePractice(data: SavePracticeRequest): Promise<PracticeRecord> {
    const res = await api.post<ApiResponse<PracticeRecord>>('/practice', data)
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error || '保存练习记录失败')
    }
    return res.data.data
  },

  async getDashboard(): Promise<DashboardStats> {
    const res = await api.get<ApiResponse<DashboardStats>>('/stats/dashboard')
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error || '获取统计数据失败')
    }
    return res.data.data
  },

  async getHistory(limit = 50): Promise<PracticeRecord[]> {
    const res = await api.get<ApiResponse<PracticeRecord[]>>('/stats/history', {
      params: { limit },
    })
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error || '获取历史记录失败')
    }
    return res.data.data
  },

  // Local history for non-authenticated users
  saveLocalHistory(entry: LocalHistoryEntry): void {
    try {
      const history = this.getLocalHistory()
      history.unshift(entry)
      // Keep last 100 entries
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history.slice(0, 100)))
    } catch {}
  },

  getLocalHistory(): LocalHistoryEntry[] {
    try {
      const saved = localStorage.getItem(LOCAL_HISTORY_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  },

  getLocalHistoryForArticle(articleId: string | null): LocalHistoryEntry[] {
    if (!articleId) return []
    return this.getLocalHistory().filter((e) => e.articleId === articleId)
  },
}
