import type { TypingStatus } from '../../types'

interface Props {
  wpm: number
  accuracy: number
  progress: number
  status: TypingStatus
}

export function StatsBar({ wpm, accuracy, progress, status }: Props) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-6"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      {/* WPM */}
      <div className="flex-1 text-center">
        <div className="text-2xl font-bold font-mono" style={{ color: 'var(--accent)' }}>
          {wpm}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          WPM
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-10" style={{ backgroundColor: 'var(--border)' }} />

      {/* Accuracy */}
      <div className="flex-1 text-center">
        <div
          className="text-2xl font-bold font-mono"
          style={{ color: accuracy >= 95 ? 'var(--success)' : accuracy >= 85 ? 'var(--accent)' : 'var(--error)' }}
        >
          {accuracy}%
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          准确率
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-10" style={{ backgroundColor: 'var(--border)' }} />

      {/* Progress */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            进度
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: status === 'finished' ? 'var(--success)' : 'var(--accent)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
