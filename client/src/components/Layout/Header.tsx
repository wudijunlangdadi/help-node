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
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link
            to="/"
            className="heading-serif text-base no-underline tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            TypeFlow
          </Link>
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const isActive = item.match.some((p) =>
                p === '/' ? location.pathname === p : location.pathname.startsWith(p)
              )
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-2.5 py-1 rounded-md text-sm no-underline transition-colors"
                  style={{
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-caption text-xs">{user?.username}</span>
              <button
                onClick={logout}
                className="text-caption text-xs hover:opacity-70 transition-opacity"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-caption text-xs no-underline px-3 py-1 rounded-md transition-colors"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
