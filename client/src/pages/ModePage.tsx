import { useNavigate } from 'react-router-dom'
import { usePracticeStore } from '../stores/practiceStore'
import type { PracticeMode } from '../types'

const modes: { key: PracticeMode; label: string; icon: string; desc: string }[] = [
  { key: 'english', label: '英文', icon: '🔤', desc: '经典英文文学、技术文章' },
  { key: 'chinese', label: '中文', icon: '🀄', desc: '经典散文、现代文选' },
  { key: 'code', label: '代码', icon: '💻', desc: 'Python 语法、算法片段' },
]

export default function ModePage() {
  const navigate = useNavigate()
  const setMode = usePracticeStore((s) => s.setMode)

  const handleSelect = (mode: PracticeMode) => {
    setMode(mode)
    navigate(`/articles/${mode}`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          TypeFlow
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>选择练习模式</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => handleSelect(mode.key)}
            className="group p-6 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="text-4xl mb-3">{mode.icon}</div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {mode.label}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {mode.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
