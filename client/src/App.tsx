import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './components/Layout/Header'
import { useAuthStore } from './stores/authStore'

// Lazy load pages
import { lazy, Suspense } from 'react'

const ModePage = lazy(() => import('./pages/ModePage'))
const ArticleListPage = lazy(() => import('./pages/ArticleListPage'))
const PracticePage = lazy(() => import('./pages/PracticePage'))
const ResultPage = lazy(() => import('./pages/ResultPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))

function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div
        className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{
          borderColor: 'var(--border)',
          borderTopColor: 'var(--accent)',
        }}
      />
    </div>
  )
}

export default function App() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Header />
        <main className="flex-1 flex flex-col">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<ModePage />} />
              <Route path="/articles/:mode" element={<ArticleListPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/practice/result" element={<ResultPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  )
}
