import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'typing-practice-secret-key-change-in-production'

export interface AuthRequest extends Request {
  userId?: string
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: '未登录' })
  }

  const token = authHeader.substring(7)
  try {
    const payload = verifyToken(token)
    req.userId = payload.userId
    next()
  } catch {
    return res.status(401).json({ success: false, error: 'token无效或已过期' })
  }
}
