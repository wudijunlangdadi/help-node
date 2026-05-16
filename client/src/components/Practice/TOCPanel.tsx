import { useState } from 'react'
import type { TOCItem } from '../../utils/segmentation'

interface Props {
  items: TOCItem[]
  onJump: (segmentIndex: number) => void
}

export function TOCPanel({ items, onJump }: Props) {
  const [open, setOpen] = useState(false)

  if (items.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        目录
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-full mt-1 z-50 w-64 max-h-80 overflow-y-auto rounded-xl shadow-lg"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="p-2">
              <div
                className="text-xs font-semibold px-2 py-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                目录 ({items.length} 章节)
              </div>
              {items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onJump(item.segmentIndex)
                    setOpen(false)
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
