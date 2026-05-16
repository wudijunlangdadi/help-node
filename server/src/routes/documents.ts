import { Router } from 'express'
import multer from 'multer'
import prisma from '../db/index.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

export const documentsRouter = Router()

// POST /api/documents/upload (requires auth)
documentsRouter.post('/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({ success: false, error: '请上传文件' })
    }

    let content = ''
    let fileType = 'txt'
    const title = file.originalname

    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      content = file.buffer.toString('utf-8')
      fileType = 'txt'
    } else if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      try {
        const pdfParse = (await import('pdf-parse')).default
        const data = await pdfParse(file.buffer)
        content = data.text
        fileType = 'pdf'
      } catch {
        return res.status(400).json({ success: false, error: 'PDF解析失败' })
      }
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.originalname.endsWith('.docx')
    ) {
      try {
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ buffer: file.buffer })
        content = result.value
        fileType = 'docx'
      } catch {
        return res.status(400).json({ success: false, error: 'Word文档解析失败' })
      }
    } else {
      return res.status(400).json({ success: false, error: '不支持的文件格式，请上传 txt/pdf/docx 文件' })
    }

    // Determine mode based on content
    let mode = 'english'
    if (/[一-鿿]/.test(content)) {
      mode = 'chinese'
    } else if (content.includes('def ') || content.includes('import ') || content.includes('function ')) {
      mode = 'code'
    }

    const document = await prisma.document.create({
      data: {
        userId: req.userId!,
        title,
        content,
        fileType,
        mode,
      },
    })

    res.json({ success: true, data: document })
  } catch (error) {
    console.error('Upload document error:', error)
    res.status(500).json({ success: false, error: '上传文件失败' })
  }
})

// GET /api/documents (requires auth)
documentsRouter.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ success: true, data: documents })
  } catch (error) {
    console.error('Get documents error:', error)
    res.status(500).json({ success: false, error: '获取文档列表失败' })
  }
})
