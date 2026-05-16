import { Router } from 'express'
import prisma from '../db/index.js'

export const articlesRouter = Router()

// GET /api/articles?mode=english
articlesRouter.get('/', async (req, res) => {
  try {
    const { mode } = req.query
    const where: any = { source: 'builtin' }
    if (mode) where.mode = mode

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    })

    res.json({ success: true, data: articles })
  } catch (error) {
    console.error('Get articles error:', error)
    res.status(500).json({ success: false, error: '获取文章失败' })
  }
})

// GET /api/articles/:id
articlesRouter.get('/:id', async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: req.params.id },
    })

    if (!article) {
      return res.status(404).json({ success: false, error: '文章不存在' })
    }

    res.json({ success: true, data: article })
  } catch (error) {
    console.error('Get article error:', error)
    res.status(500).json({ success: false, error: '获取文章失败' })
  }
})
