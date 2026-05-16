import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../db/index.js'
import { generateToken } from '../middleware/auth.js'

export const authRouter = Router()

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: '请填写所有字段' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: '密码长度至少6位' })
    }

    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    })

    if (existing) {
      return res.status(400).json({ success: false, error: '用户名或邮箱已被注册' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    })

    const token = generateToken(user.id)

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt },
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, error: '注册失败' })
  }
})

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ success: false, error: '请填写所有字段' })
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }] },
    })

    if (!user) {
      return res.status(401).json({ success: false, error: '用户名或密码错误' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ success: false, error: '用户名或密码错误' })
    }

    const token = generateToken(user.id)

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt },
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, error: '登录失败' })
  }
})
