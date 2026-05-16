import { useState, useEffect } from 'react'
import { usePracticeStore } from '../../stores/practiceStore'
import { builtinArticles } from '../../data/builtinArticles'
import type { Article } from '../../types'

interface Props {
  onSelect: (article: Article) => void
  selectedId?: string
}

export function ArticleList({ onSelect, selectedId }: Props) {
  const { mode } = usePracticeStore()
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    // Use built-in articles for now
    setArticles(builtinArticles[mode] || [])
  }, [mode])

  return (
    <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
      {articles.map((article) => (
        <button
          key={article.id}
          onClick={() => onSelect(article)}
          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: selectedId === article.id ? 'var(--accent)' + '15' : 'transparent',
            color: selectedId === article.id ? 'var(--accent)' : 'var(--text-primary)',
            border: selectedId === article.id ? '1px solid var(--accent)' + '40' : '1px solid transparent',
          }}
        >
          <div className="font-medium truncate">{article.title}</div>
          <div
            className="text-xs mt-0.5 truncate"
            style={{ color: 'var(--text-muted)' }}
          >
            {article.content.substring(0, 40)}...
          </div>
        </button>
      ))}
    </div>
  )
}
