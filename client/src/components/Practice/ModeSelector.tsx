import { usePracticeStore } from '../../stores/practiceStore'
import type { PracticeMode } from '../../types'

const modes: { key: PracticeMode; label: string; icon: string }[] = [
  { key: 'english', label: '英文', icon: '🔤' },
  { key: 'chinese', label: '中文', icon: '🀄' },
  { key: 'code', label: '代码', icon: '💻' },
]

export function ModeSelector() {
  const { mode, setMode, reset } = usePracticeStore()

  const handleModeChange = (newMode: PracticeMode) => {
    if (newMode !== mode) {
      setMode(newMode)
      reset()
    }
  }

  return (
    <div className="flex gap-2">
      {modes.map((m) => (
        <button
          key={m.key}
          onClick={() => handleModeChange(m.key)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: mode === m.key ? 'var(--accent)' : 'var(--bg-secondary)',
            color: mode === m.key ? 'white' : 'var(--text-secondary)',
            border: mode === m.key ? 'none' : '1px solid var(--border)',
          }}
        >
          <span>{m.icon}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  )
}
