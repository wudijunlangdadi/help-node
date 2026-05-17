import { useSettingsStore } from '../../stores/settingsStore'

export function FontSizeControl() {
  const { fontSize, decreaseFontSize, increaseFontSize } = useSettingsStore()

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={decreaseFontSize}
        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
        style={{ color: 'var(--text-muted)' }}
        aria-label="减小字号"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <text x="2" y="12" fontSize="10" fontWeight="600" fill="currentColor">A</text>
          <line x1="10" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <span className="text-caption text-xs w-6 text-center tabular-nums">{fontSize}</span>
      <button
        onClick={increaseFontSize}
        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
        style={{ color: 'var(--text-muted)' }}
        aria-label="增大字号"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <text x="1" y="12" fontSize="10" fontWeight="600" fill="currentColor">A</text>
          <line x1="9" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="11" y1="6" x2="11" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
