import type { TypingStatus } from '../../types'

interface Props {
  wpm: number
  accuracy: number
  progress: number
  status: TypingStatus
}

export function StatsBar({ wpm, accuracy, progress, status }: Props) {
  return (
    <div className="flex items-center gap-4">
      {/* WPM */}
      <div className="flex items-baseline gap-1.5">
        <span className="heading-serif text-2xl tabular-nums" style={{ color: 'var(--accent)' }}>
          {wpm}
        </span>
        <span className="text-caption text-xs">WPM</span>
      </div>

      {/* Dot separator */}
      <span style={{ color: 'var(--border)' }}>·</span>

      {/* Accuracy */}
      <div className="flex items-baseline gap-1.5">
        <span
          className="heading-serif text-2xl tabular-nums"
          style={{ color: accuracy >= 95 ? 'var(--success)' : accuracy >= 85 ? 'var(--accent)' : 'var(--error)' }}
        >
          {accuracy}
        </span>
        <span className="text-caption text-xs">%</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Progress */}
      <div className="flex items-center gap-2">
        <span className="text-caption text-xs tabular-nums">{Math.round(progress * 100)}%</span>
        <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress * 100}%`,
              background: status === 'finished' ? 'var(--success)' : 'var(--accent)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
