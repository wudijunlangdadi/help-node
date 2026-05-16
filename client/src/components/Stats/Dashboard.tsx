import type { DashboardStats } from '../../types'

interface Props {
  stats: DashboardStats
}

export function Dashboard({ stats }: Props) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}小时${mins}分钟`
    return `${mins}分钟`
  }

  const cards = [
    { label: '总练习次数', value: stats.totalPractices.toString(), icon: '📝', color: 'var(--accent)' },
    { label: '总练习时长', value: formatDuration(stats.totalDuration), icon: '⏱️', color: 'var(--accent)' },
    { label: '平均 WPM', value: stats.avgWpm.toString(), icon: '⚡', color: 'var(--accent)' },
    { label: '平均准确率', value: `${stats.avgAccuracy}%`, icon: '🎯', color: 'var(--success)' },
    { label: '最高 WPM', value: stats.bestWpm.toString(), icon: '🏆', color: 'var(--success)' },
    { label: '最高准确率', value: `${stats.bestAccuracy}%`, icon: '💎', color: 'var(--success)' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl p-4 text-center"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <div className="text-2xl mb-2">{card.icon}</div>
          <div className="text-xl font-bold font-mono" style={{ color: card.color }}>
            {card.value}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {card.label}
          </div>
        </div>
      ))}
    </div>
  )
}
