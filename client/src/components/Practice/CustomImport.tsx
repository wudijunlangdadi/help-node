import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePracticeStore } from '../../stores/practiceStore'
import { useImportStore } from '../../stores/importStore'

export function CustomImport() {
  const navigate = useNavigate()
  const { mode } = usePracticeStore()
  const addText = useImportStore((s) => s.addText)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showTextInput, setShowTextInput] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [titleInput, setTitleInput] = useState('')

  const handleImport = (title: string, content: string) => {
    const id = addText(title, content, mode)
    setTextInput('')
    setTitleInput('')
    setShowTextInput(false)
    navigate(`/practice?importId=${id}`)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text()
      const title = file.name.replace(/\.txt$/i, '')
      handleImport(title, text)
    } else {
      alert('PDF 和 Word 文件需要上传到服务器解析，此功能将在后端完成后启用')
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px dashed var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        📄 导入文件 (txt)
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
