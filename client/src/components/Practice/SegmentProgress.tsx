interface Props {
  current: number
  total: number
}

export function SegmentProgress({ current, total }: Props) {
  if (total <= 1) return null

  return (
    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
      <span>第 {current + 1} / {total} 段</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${((current) / total) * 100}%`,
            backgroundColor: 'var(--accent)',
          }}
        />
      </div>
    </div>
  )
}
