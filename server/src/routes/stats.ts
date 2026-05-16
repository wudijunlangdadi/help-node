import { Router } from 'express'
import prisma from '../db/index.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

export const statsRouter = Router()

// GET /api/stats/dashboard (requires auth)
statsRouter.get('/dashboard', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!

    const practices = await prisma.practice.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    })

    if (practices.length === 0) {
      return res.json({
        success: true,
        data: {
          totalPractices: 0,
          totalDuration: 0,
          avgWpm: 0,
          avgAccuracy: 0,
          bestWpm: 0,
          bestAccuracy: 0,
          recentPractices: [],
          wpmTrend: [],
          accuracyTrend: [],
          topErrors: [],
          modeStats: [],
        },
      })
    }

    // Calculate stats
    const totalPractices = practices.length
    const totalDuration = practices.reduce((sum, p) => sum + p.duration, 0)
    const avgWpm = Math.round(practices.reduce((sum, p) => sum + p.wpm, 0) / totalPractices)
    const avgAccuracy = Math.round((practices.reduce((sum, p) => sum + p.accuracy, 0) / totalPractices) * 10) / 10
    const bestWpm = Math.max(...practices.map((p) => p.wpm))
    const bestAccuracy = Math.max(...practices.map((p) => p.accuracy))

    // WPM trend (by date)
    const dateMap = new Map<string, { wpmSum: number; accSum: number; count: number }>()
    practices.forEach((p) => {
      const date = p.createdAt.toISOString().split('T')[0]
      const existing = dateMap.get(date) || { wpmSum: 0, accSum: 0, count: 0 }
      existing.wpmSum += p.wpm
      existing.accSum += p.accuracy
      existing.count++
      dateMap.set(date, existing)
    })

    const wpmTrend = Array.from(dateMap.entries()).map(([date, data]) => ({
      date: date.substring(5),
      wpm: Math.round(data.wpmSum / data.count),
    }))

    const accuracyTrend = Array.from(dateMap.entries()).map(([date, data]) => ({
      date: date.substring(5),
      accuracy: Math.round((data.accSum / data.count) * 10) / 10,
    }))

    // Top errors
    const errorMap = new Map<string, number>()
    practices.forEach((p) => {
      const errors = JSON.parse(p.errorChars) as Record<string, number>
      Object.entries(errors).forEach(([char, count]) => {
        errorMap.set(char, (errorMap.get(char) || 0) + count)
      })
    })
    const topErrors = Array.from(errorMap.entries())
      .map(([char, count]) => ({ char, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Mode stats
    const modeMap = new Map<string, { wpmSum: number; accSum: number; count: number }>()
    practices.forEach((p) => {
      const existing = modeMap.get(p.mode) || { wpmSum: 0, accSum: 0, count: 0 }
      existing.wpmSum += p.wpm
      existing.accSum += p.accuracy
      existing.count++
      modeMap.set(p.mode, existing)
    })
    const modeStats = Array.from(modeMap.entries()).map(([mode, data]) => ({
      mode,
      count: data.count,
      avgWpm: Math.round(data.wpmSum / data.count),
      avgAccuracy: Math.round((data.accSum / data.count) * 10) / 10,
    }))

    res.json({
      success: true,
      data: {
        totalPractices,
        totalDuration,
        avgWpm,
        avgAccuracy,
        bestWpm,
        bestAccuracy,
        recentPractices: practices.slice(-10).map((p) => ({ ...p, errorChars: JSON.parse(p.errorChars) })),
        wpmTrend,
        accuracyTrend,
        topErrors,
        modeStats,
      },
    })
  } catch (error) {
    console.error('Get dashboard error:', error)
    res.status(500).json({ success: false, error: '获取统计数据失败' })
  }
})
