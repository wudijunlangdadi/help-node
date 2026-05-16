import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { Dashboard } from '../components/Stats/Dashboard'
import { ErrorAnalysis } from '../components/Stats/ErrorAnalysis'
import { HistoryChart } from '../components/Stats/HistoryChart'
import type { DashboardStats } from '../types'

// Mock data for development
const mockStats: DashboardStats = {
  totalPractices: 42,
  totalDuration: 3600,
  avgWpm: 55,
  avgAccuracy: 92.5,
  bestWpm: 78,
  bestAccuracy: 98.2,
  recentPractices: [],
  wpmTrend: [
    { date: '05-10', wpm: 45 },
    { date: '05-11', wpm: 48 },
    { date: '05-12', wpm: 52 },
    { date: '05-13', wpm: 50 },
    { date: '05-14', wpm: 55 },
    { date: '05-15', wpm: 58 },
    { date: '05-16', wpm: 60 },
  ],
  accuracyTrend: [
    { date: '05-10', accuracy: 88 },
    { date: '05-11', accuracy: 89 },
    { date: '05-12', accuracy: 91 },
    { date: '05-13', accuracy: 90 },
    { date: '05-14', accuracy: 92 },
    { date: '05-15', accuracy: 93 },
    { date: '05-16', accuracy: 94 },
  ],
  topErrors: [
    { char: 'a', count: 23 },
    { char: 'e', count: 18 },
    { char: 't', count: 15 },
    { char: 'o', count: 12 },
    { char: 'i', count: 10 },
  ],
  modeStats: [
    { mode: 'english', count: 25, avgWpm: 58, avgAccuracy: 93 },
    { mode: 'chinese', count: 10, avgWpm: 45, avgAccuracy: 90 },
    { mode: 'code', count: 7, avgWpm: 35, avgAccuracy: 88 },
  ],
}

export default function StatsPage() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      // Show mock data for non-authenticated users
      return
    }
    // TODO: Fetch real stats from API
    setLoading(true)
    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 500)
  }, [isAuthenticated])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          练习统计
        </h1>
        {!isAuthenticated && (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            登录同步数据
          </button>
        )}
      </div>

      <Dashboard stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <HistoryChart
          title="WPM 趋势"
          data={stats.wpmTrend}
          dataKey="wpm"
          color="var(--accent)"
        />
        <HistoryChart
          title="准确率趋势"
          data={stats.accuracyTrend}
          dataKey="accuracy"
          color="var(--success)"
          unit="%"
        />
      </div>

      <div className="mt-6">
        <ErrorAnalysis errors={stats.topErrors} />
      </div>
    </div>
  )
}
