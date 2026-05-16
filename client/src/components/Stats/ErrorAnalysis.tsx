interface Props {
  errors: { char: string; count: number }[]
}

export function ErrorAnalysis({ errors }: Props) {
  if (errors.length === 0) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          暂无错字数据，开始练习后将显示分析
        </p>
      </div>
    )
  }

  const maxCount = Math.max(...errors.map((e) => e.count))

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        常错字符分析
      </h3>
      <div className="space-y-3">
        {errors.map(({ char, count }) => (
          <div key={char} className="flex items-center gap-3">
            <span
              className="w-8 h-8 flex items-center justify-center rounded-lg font-mono text-sm font-bold"
              style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}
            >
              {char === ' ' ? '␣' : char}
            </span>
            <div className="flex-1">
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(count / maxCount) * 100}%`,
                    backgroundColor: 'var(--error)',
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
            <span className="text-sm font-mono w-10 text-right" style={{ color: 'var(--text-secondary)' }}>
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
