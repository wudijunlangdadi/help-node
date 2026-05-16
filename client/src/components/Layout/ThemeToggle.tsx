import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full transition-colors duration-300"
      style={{ backgroundColor: theme === 'dark' ? 'var(--accent)' : 'var(--bg-tertiary)' }}
      aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
    >
      <span
        className="absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-xs"
        style={{
          left: theme === 'dark' ? '30px' : '2px',
          backgroundColor: 'var(--bg-primary)',
          boxShadow: 'var(--shadow)',
        }}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
