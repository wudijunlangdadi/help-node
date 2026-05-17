import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { usePracticeStore } from '../stores/practiceStore'
import { useImportStore } from '../stores/importStore'
import { ArticleList } from '../components/Practice/ArticleList'
import { CustomImport } from '../components/Practice/CustomImport'
import type { PracticeMode, Article } from '../types'

const modeLabels: Record<PracticeMode, string> = {
  english: 'English',
  chinese: '中文',
  code: 'Code',
}

const modeSublabels: Record<PracticeMode, string> = {
  english: '英文练习',
  chinese: '中文练习',
  code: '代码练习',
}

export default function ArticleListPage() {
  const { mode } = useParams<{ mode: string }>()
  const navigate = useNavigate()
  const { mode: storeMode, setMode, selectedArticleId, setSelectedArticle } = usePracticeStore()
  const { texts, removeText } = useImportStore()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    if (mode && mode !== storeMode && ['english', 'chinese', 'code'].includes(mode)) {
      setMode(mode as PracticeMode)
    }
  }, [mode, storeMode, setMode])

  const filteredImports = texts.filter((t) => t.mode === storeMode)

  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article.id, article.title)
    navigate('/practice')
  }

  const handleSelectImport = (id: string) => {
    navigate(`/practice?importId=${id}`)
  }

  const handleDeleteImport = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation()
    setDeleteTarget({ id, title })
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      removeText(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  const progressPercent = (item: { lastSegmentIndex: number; totalSegments: number }) => {
    if (item.totalSegments <= 1) return item.lastSegmentIndex > 0 ? 100 : 0
    return Math.round((item.lastSegmentIndex / item.totalSegments) * 100)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 page-enter">
      {/* Header */}
      <header className="mb-10">
        <button
          onClick={() => navigate('/')}
          className="text-caption mb-4 flex items-center gap-1 hover:opacity-70 transition-opacity"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          返回
        </button>
        <h1 className="text-headline" style={{ color: 'var(--text-primary)' }}>
          {modeLabels[storeMode]}
        </h1>
        <p className="text-caption mt-1">{modeSublabels[storeMode]}</p>
        <div className="divider" />
      </header>

      {/* Imported texts */}
      {filteredImports.length > 0 && (
        <section className="mb-10">
          <h2 className="text-subhead mb-4" style={{ color: 'var(--text-primary)' }}>
            我的导入
          </h2>
          <div className="space-y-3">
            {filteredImports.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectImport(item.id)}
                className="card card-interactive w-full text-left p-4 group relative"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate mb-1" style={{ color: 'var(--text-primary)' }}>
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 text-caption">
                      <span>{item.totalSegments} 段</span>
                      <span>{formatDate(item.importedAt)}</span>
                    </div>
                    {item.tocItems.length > 0 && (() => {
                      const chapters = item.tocItems.filter((t) => (t.level ?? 0) === 0)
                      const shown = chapters.slice(0, 6)
                      return (
                        <div className="mt-2 space-y-0.5">
                          {shown.map((toc, j) => (
                            <div key={j} className="flex items-baseline gap-2 text-xs">
                              <span className="tabular-nums flex-shrink-0" style={{ color: 'var(--accent)', minWidth: '1.5em' }}>
                                {j + 1}
                              </span>
                              <span className="truncate font-medium" style={{ color: 'var(--text-primary)' }}>
                                {toc.title}
                              </span>
                            </div>
                          ))}
                          {chapters.length > 6 && (
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              ...共 {chapters.length} 章
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                  <button
                    onClick={(e) => handleDeleteImport(e, item.id, item.title)}
                    className="opacity-0 group-hover:opacity-100 ml-3 p-1.5 rounded-lg transition-opacity hover:bg-[var(--error-light)]"
                    style={{ color: 'var(--error)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progressPercent(item)}%`,
                      background: item.lastSegmentIndex >= item.totalSegments ? 'var(--success)' : 'var(--accent)',
                    }}
                  />
                </div>
                <div className="text-caption mt-1.5">
                  {item.lastSegmentIndex >= item.totalSegments
                    ? '已完成'
                    : `第 ${item.lastSegmentIndex + 1} / ${item.totalSegments} 段`}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Built-in articles */}
      <section className="mb-10">
        <h2 className="text-subhead mb-4" style={{ color: 'var(--text-primary)' }}>
          内置文章
        </h2>
        <ArticleList onSelect={handleSelectArticle} selectedId={selectedArticleId ?? undefined} />
      </section>

      {/* Import section */}
      <section>
        <div className="card p-5">
          <CustomImport />
        </div>
      </section>

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div
            className="card p-6 mx-4"
            style={{ maxWidth: '360px', width: '100%', backgroundColor: 'var(--bg-card)' }}
          >
            <h3 className="heading-serif text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              确认删除
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              确定要删除「{deleteTarget.title}」吗？此操作无法撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--error)', color: 'white' }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
