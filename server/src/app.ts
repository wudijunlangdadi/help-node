import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { articlesRouter } from './routes/articles.js'
import { practiceRouter } from './routes/practice.js'
import { statsRouter } from './routes/stats.js'
import { documentsRouter } from './routes/documents.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/articles', articlesRouter)
app.use('/api/documents', documentsRouter)
app.use('/api/practice', practiceRouter)
app.use('/api/stats', statsRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
