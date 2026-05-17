import { useNavigate } from 'react-router-dom'
import { usePracticeStore } from '../stores/practiceStore'
import type { PracticeMode } from '../types'

const modes: { key: PracticeMode; label: string; sublabel: string; desc: string; icon: string; color: string }[] = [
  {
    key: 'english',
    label: 'English',
    sublabel: '英文打字',
    desc: '经典文学 · 技术文档 · 日常写作',
    icon: 'A',
    color: '#c4841d',
  },
  {
    key: 'chinese',
    label: '中文',
    sublabel: '中文打字',
    desc: '经典散文 · 现代文选 · 诗词',
    icon: '文',
    color: '#6b7f3a',
  },
  {
    key: 'code',
    label: 'Code',
    sublabel: '代码打字',
    desc: 'Python · JavaScript · 算法',
    icon: '</>',
    color: '#5a7fa8',
  },
]

export default function ModePage() {
  const navigate = useNavigate()
  const setMode = usePracticeStore((s) => s.setMode)

  const handleSelect = (mode: PracticeMode) => {
    setMode(mode)
    navigate(`/articles/${mode}`)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 page-enter">
      {/* Hero */}
      <header className="text-center mb-14">
        <h1 className="text-display mb-3" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
          TypeFlow
        </h1>
        <p className="text-subhead" style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
          沉浸式打字练习，提升你的输入速度与准确率
        </p>
      </header>

      {/* Mode cards */}
      <div className="flex flex-col gap-5 w-full" style={{ maxWidth: '480px' }}>
        {modes.map((mode, i) => (
          <button
            key={mode.key}
            onClick={() => handleSelect(mode.key)}
            className="w-full text-left transition-all duration-200 group"
            style={{ animation: `pageEnter 0.4s ease-out ${i * 0.12}s both` }}
          >
            <div className="card card-interactive p-5 flex items-center gap-5">
              {/* Icon circle */}
              <div
                className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: `${mode.color}18`,
                  color: mode.color,
                  fontFamily: mode.key === 'code' ? 'var(--font-mono)' : mode.key === 'chinese' ? 'var(--font-serif)' : 'var(--font-sans)',
                  fontSize: mode.key === 'code' ? '1.1rem' : '1.5rem',
                  fontWeight: 700,
                }}
              >
                {mode.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <h2 className="heading-serif text-lg" style={{ color: 'var(--text-primary)' }}>
                    {mode.label}
                  </h2>
                  <span className="text-caption text-xs">{mode.sublabel}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {mode.desc}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--text-muted)' }}>
                  <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p className="text-center text-caption mt-10">
        或在文章列表中导入你自己的文本
      </p>
    </div>
  )
}
