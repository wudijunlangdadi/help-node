import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePracticeStore } from '../../stores/practiceStore'
import { useImportStore } from '../../stores/importStore'
import type { TOCItem } from '../../utils/segmentation'

export function CustomImport() {
  const navigate = useNavigate()
  const { mode } = usePracticeStore()
  const addText = useImportStore((s) => s.addText)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showTextInput, setShowTextInput] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [titleInput, setTitleInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImport = (title: string, content: string, pdfTocItems?: TOCItem[]) => {
    if (!content.trim()) {
      setError('文件内容为空')
      return
    }
    try {
      const id = addText(title, content, mode, pdfTocItems)
      setTextInput('')
      setTitleInput('')
      setShowTextInput(false)
      setError('')
      navigate(`/practice?importId=${id}`)
    } catch (err) {
      setError('导入失败，请重试')
      console.error('Import error:', err)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      let text = ''
      let title = ''
      let pdfTocItems: TOCItem[] | undefined
      const name = file.name

      if (name.endsWith('.txt') || file.type === 'text/plain') {
        text = await file.text()
        title = name.replace(/\.txt$/i, '')
      } else if (name.endsWith('.pdf') || file.type === 'application/pdf') {
        const { extractTextFromPDF } = await import('../../utils/pdfReader')
        const result = await extractTextFromPDF(file)
        text = result.text
        pdfTocItems = result.tocItems
        title = name.replace(/\.pdf$/i, '')
      } else if (name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const { extractTextFromDOCX } = await import('../../utils/docxReader')
        text = await extractTextFromDOCX(file)
        title = name.replace(/\.docx$/i, '')
      } else if (name.endsWith('.doc')) {
        setError('暂不支持 .doc 格式，请转换为 .docx 后重试')
        return
      } else {
        setError('支持 .txt / .pdf / .docx 文件')
        return
      }

      if (!text.trim()) {
        setError('未能从文件中提取到文本内容')
        return
      }

      handleImport(title, text, pdfTocItems)
    } catch (err) {
      setError(`文件读取失败: ${err instanceof Error ? err.message : '未知错误'}`)
      console.error('File read error:', err)
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      const title = titleInput.trim() || '自定义文本'
      handleImport(title, textInput.trim())
    }
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
        自定义文本
      </h4>

      {error && (
        <div className="text-xs px-3 py-2 rounded-lg" style={{ color: 'var(--error)', backgroundColor: 'rgba(239,68,68,0.1)' }}>
          {error}
        </div>
      )}

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px dashed var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        {loading ? '读取中...' : '📄 导入文件 (txt / pdf / docx)'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf,.docx"
        onChange={handleFileUpload}
        className="hidden"
      />

      <button
        onClick={() => setShowTextInput(!showTextInput)}
        className="w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px dashed var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        ✏️ 粘贴文本
      </button>

      {showTextInput && (
        <div className="space-y-2">
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="标题（可选）"
            className="w-full px-3 py-1.5 rounded-lg text-xs"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="在此粘贴要练习的文本..."
            className="w-full px-3 py-2 rounded-lg text-xs resize-none h-24"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            className="w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            开始练习
          </button>
        </div>
      )}
    </div>
  )
}
