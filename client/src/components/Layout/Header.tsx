import { Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useAuthStore } from '../../stores/authStore'

export function Header() {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuthStore()

  const navItems = [
    { path: '/', label: '练习', match: ['/', '/articles', '/practice'] },
    { path: '/stats', label: '统计', match: ['/stats'] },
  ]

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-sm"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border)',
        opacity: 0.95,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-semibold no-underline" style={{ color: 'var(--accent)' }}>
            TypeFlow
          </Link>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-3 py-1.5 rounded-md text-sm font-medium no-underline transition-colors"
                style={{
                  color: item.match.some((p) => p === '/' ? location.pathname === p : location.pathname.startsWith(p)) ? 'var(--accent)' : 'var(--text-secondary)',
                  backgroundColor: item.match.some((p) => p === '/' ? location.pathname === p : location.pathname.startsWith(p)) ? 'var(--accent)' + '15' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {user?.username}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-md text-sm transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-md text-sm font-medium no-underline transition-colors"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
              }}
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
