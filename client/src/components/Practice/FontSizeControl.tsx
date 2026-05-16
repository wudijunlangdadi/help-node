import { useSettingsStore } from '../../stores/settingsStore'

export function FontSizeControl() {
  const { fontSize, decreaseFontSize, increaseFontSize } = useSettingsStore()

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={decreaseFontSize}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        A-
      </button>
      <span className="w-10 text-center" style={{ color: 'var(--text-muted)' }}>
        {fontSize}
      </span>
      <button
        onClick={increaseFontSize}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        A+
      </button>
    </div>
  )
}
