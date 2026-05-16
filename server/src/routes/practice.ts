import { Router } from 'express'
import prisma from '../db/index.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

export const practiceRouter = Router()

// POST /api/practice (requires auth)
practiceRouter.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { articleId, mode, wpm, accuracy, errorCount, duration, errorChars } = req.body

    const practice = await prisma.practice.create({
      data: {
        userId: req.userId!,
        articleId: articleId || null,
        mode,
        wpm,
        accuracy,
        errorCount,
        duration,
        errorChars: JSON.stringify(errorChars || {}),
      },
    })

    res.json({ success: true, data: practice })
  } catch (error) {
    console.error('Save practice error:', error)
    res.status(500).json({ success: false, error: '保存练习记录失败' })
  }
})

// GET /api/practice/history?limit=50 (requires auth)
practiceRouter.get('/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50

    const practices = await prisma.practice.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { article: { select: { title: true } } },
    })

    const formatted = practices.map((p) => ({
      ...p,
      errorChars: JSON.parse(p.errorChars),
    }))

    res.json({ success: true, data: formatted })
  } catch (error) {
    console.error('Get history error:', error)
    res.status(500).json({ success: false, error: '获取历史记录失败' })
  }
})
