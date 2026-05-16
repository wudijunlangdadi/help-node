import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../stores/sessionStore'
import { usePracticeStore } from '../stores/practiceStore'
import { statsService } from '../services/statsService'
import type { TypingResult } from '../types'

export default function ResultPage() {
  const navigate = useNavigate()
  const {
    articleId,
    articleTitle,
    mode,
    segmentResults,
    getAggregateResult,
    resetSession,
  } = useSessionStore()
  const { reset: resetPractice } = usePracticeStore()

  const result = getAggregateResult()

  // Save to local history and find historical bests
  const { bestWpm, bestAccuracy } = useMemo(() => {
    if (!result) return { bestWpm: 0, bestAccuracy: 0 }

    // Save current result
    statsService.saveLocalHistory({
      articleId,
      articleTitle,
      mode,
      wpm: result.wpm,
      accuracy: result.accuracy,
      errorCount: result.errorCount,
      duration: result.duration,
      createdAt: new Date().toISOString(),
    })

    // Get historical bests (excluding current)
    const history = statsService.getLocalHistoryForArticle(articleId)
    const pastEntries = history.slice(1) // Skip the one we just saved
    return {
      bestWpm: pastEntries.length > 0 ? Math.max(...pastEntries.map((e) => e.wpm)) : 0,
      bestAccuracy: pastEntries.length > 0 ? Math.max(...pastEntries.map((e) => e.accuracy)) : 0,
    }
  }, [result, articleId, articleTitle, mode])

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p style={{ color: 'var(--text-muted)' }}>没有练习结果</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          返回首页
        </button>
      </div>
    )
  }

  const handleRestart = () => {
    resetSession()
    navigate('/practice')
  }

  const handleNewPractice = () => {
    resetSession()
    resetPractice()
    navigate(`/articles/${mode}`)
  }

  const handleHome = () => {
    resetSession()
    resetPractice()
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          {articleTitle}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>练习完成</p>
      </div>

      {/* Grade */}
      <GradeDisplay result={result} />

      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="WPM" value={result.wpm.toString()} icon="⚡" />
        <StatCard label="准确率" value={`${result.accuracy}%`} icon="🎯" />
        <StatCard label="用时" value={formatDuration(result.duration)} icon="⏱️" />
        <StatCard label="错误数" value={result.errorCount.toString()} icon="❌" />
      </div>

      {/* Segment breakdown */}
      {segmentResults.length > 1 && (
        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            分段详情
          </h3>
          <div className="space-y-2">
            {segmentResults.map((sr, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
              >
                <span style={{ color: 'var(--text-muted)' }}>第 {i + 1} 段</span>
                <div className="flex gap-4">
                  <span style={{ color: 'var(--text-primary)' }}>
                    <strong>{sr.result.wpm}</strong> WPM
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    <strong>{sr.result.accuracy}%</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History comparison */}
      {(bestWpm > 0 || bestAccuracy > 0) && (
        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            历史对比
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>最佳 WPM</div>
              <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{bestWpm}</div>
            </div>
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>最佳准确率</div>
              <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{bestAccuracy}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Error characters */}
      {Object.keys(result.errorChars).length > 0 && (
        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            常错字符
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(result.errorChars)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([char, count]) => (
                <span
                  key={char}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-mono"
                  style={{ backgroundColor: 'var(--error)', color: 'white', opacity: 0.9 }}
                >
                  {char === ' ' ? '␣' : char}
                  <span className="text-xs opacity-70">×{count}</span>
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleRestart}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          再来一次
        </button>
        <button
          onClick={handleNewPractice}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          换一篇
        </button>
        <button
          onClick={handleHome}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
          }}
        >
          首页
        </button>
      </div>
    </div>
  )
}

function GradeDisplay({ result }: { result: TypingResult }) {
  const grade = getGrade(result)
  return (
    <div className="text-center mb-6">
      <div className="text-6xl font-bold mb-1" style={{ color: grade.color }}>
        {grade.grade}
      </div>
      <div className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
        {grade.label}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div
      className="rounded-lg p-3 text-center"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      <div className="text-lg mb-0.5">{icon}</div>
      <div className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
    </div>
  )
}

function getGrade(result: TypingResult) {
  if (result.accuracy >= 98 && result.wpm >= 60) return { grade: 'S', color: 'var(--success)', label: '完美' }
  if (result.accuracy >= 95 && result.wpm >= 45) return { grade: 'A', color: 'var(--accent)', label: '优秀' }
  if (result.accuracy >= 90 && result.wpm >= 30) return { grade: 'B', color: 'var(--accent)', label: '良好' }
  if (result.accuracy >= 80) return { grade: 'C', color: 'var(--text-secondary)', label: '一般' }
  return { grade: 'D', color: 'var(--error)', label: '继续加油' }
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}秒`
  return `${mins}分${secs}秒`
}
