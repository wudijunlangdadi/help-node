import type { TypingResult, PracticeMode } from '../../types'

interface Props {
  result: TypingResult
  mode: PracticeMode
  onRestart: () => void
  onNewPractice: () => void
}

export function ResultPanel({ result, mode, onRestart, onNewPractice }: Props) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}秒`
    return `${mins}分${secs}秒`
  }

  const topErrors = Object.entries(result.errorChars)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const getGrade = () => {
    if (result.accuracy >= 98 && result.wpm >= 60) return { grade: 'S', color: 'var(--success)', label: '完美' }
    if (result.accuracy >= 95 && result.wpm >= 45) return { grade: 'A', color: 'var(--accent)', label: '优秀' }
    if (result.accuracy >= 90 && result.wpm >= 30) return { grade: 'B', color: 'var(--accent)', label: '良好' }
    if (result.accuracy >= 80) return { grade: 'C', color: 'var(--text-secondary)', label: '一般' }
    return { grade: 'D', color: 'var(--error)', label: '继续加油' }
  }

  const grade = getGrade()

  return (
    <div
      className="rounded-xl p-8"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      <div className="text-center mb-8">
        <div
          className="text-6xl font-bold mb-2"
          style={{ color: grade.color }}
        >
          {grade.grade}
        </div>
        <div className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          {grade.label}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="WPM" value={result.wpm.toString()} icon="⚡" />
        <StatCard label="准确率" value={`${result.accuracy}%`} icon="🎯" />
        <StatCard label="用时" value={formatDuration(result.duration)} icon="⏱️" />
        <StatCard label="错误数" value={result.errorCount.toString()} icon="❌" />
      </div>

      {topErrors.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            常错字符
          </h3>
          <div className="flex flex-wrap gap-2">
            {topErrors.map(([char, count]) => (
              <span
                key={char}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-mono"
                style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}
              >
                {char === ' ' ? '␣' : char}
                <span className="text-xs opacity-70">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <button
          onClick={onRestart}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          再来一次
        </button>
        <button
          onClick={onNewPractice}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          换一篇
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div
      className="rounded-lg p-4 text-center"
      style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
    >
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
    </div>
  )
}
