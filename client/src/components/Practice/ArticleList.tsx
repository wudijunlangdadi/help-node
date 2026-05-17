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
    setArticles(builtinArticles[mode] || [])
  }, [mode])

  return (
    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
      {articles.map((article, i) => {
        const isSelected = selectedId === article.id
        return (
          <button
            key={article.id}
            onClick={() => onSelect(article)}
            className="w-full text-left transition-all duration-200 group"
            style={{ animation: `pageEnter 0.3s ease-out ${i * 0.05}s both` }}
          >
            <div
              className="px-4 py-3 rounded-xl transition-all"
              style={{
                background: isSelected ? 'var(--accent-light)' : 'transparent',
                border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-light)'}`,
              }}
            >
              <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {article.title}
              </div>
              <div className="text-caption mt-0.5 truncate">
                {article.content.substring(0, 50)}...
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
