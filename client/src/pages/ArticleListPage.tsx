import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { usePracticeStore } from '../stores/practiceStore'
import { useImportStore } from '../stores/importStore'
import { ArticleList } from '../components/Practice/ArticleList'
import { CustomImport } from '../components/Practice/CustomImport'
import type { PracticeMode, Article } from '../types'

const modeLabels: Record<PracticeMode, string> = {
  english: '英文',
  chinese: '中文',
  code: '代码',
}

export default function ArticleListPage() {
  const { mode } = useParams<{ mode: string }>()
  const navigate = useNavigate()
  const { mode: storeMode, setMode, selectedArticleId, setSelectedArticle } = usePracticeStore()
  const { texts, removeText } = useImportStore()

  // Sync URL param to store
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

  const handleDeleteImport = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    removeText(id)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-sm mb-3 flex items-center gap-1 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          ← 返回
        </button>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {modeLabels[storeMode]}练习
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          选择文章或导入自定义文本
        </p>
      </div>

      {/* Imported texts */}
      {filteredImports.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            我的导入
          </h2>
          <div className="space-y-1.5">
            {filteredImports.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectImport(item.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{item.title}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {item.totalSegments > 1
                        ? `第 ${item.lastSegmentIndex + 1}/${item.totalSegments} 段`
                        : item.lastSegmentIndex > 0 ? '已完成' : '未开始'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(item.importedAt)}
                    </span>
                    {item.tocItems.length > 0 && (
                      <span className="text-xs" style={{ color: 'var(--accent)' }}>
                        {item.tocItems.length} 章节
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteImport(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 ml-2 px-2 py-1 rounded text-xs transition-opacity"
                  style={{ color: 'var(--error)' }}
                >
                  删除
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Built-in articles */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
          内置文章
        </h2>
        <ArticleList onSelect={handleSelectArticle} selectedId={selectedArticleId ?? undefined} />
      </div>

      {/* Import section */}
      <div
        className="p-4 rounded-xl"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
        }}
      >
        <CustomImport />
      </div>
    </div>
  )
}
