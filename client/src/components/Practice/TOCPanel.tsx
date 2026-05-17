import { useState } from 'react'
import type { TOCItem } from '../../utils/segmentation'

interface Props {
  items: TOCItem[]
  onJump: (segmentIndex: number) => void
}

interface GroupedItem {
  title: string
  segmentIndex: number
  num: string
  children: { title: string; segmentIndex: number; num: string }[]
}

function groupByChapter(items: TOCItem[]): GroupedItem[] {
  const groups: GroupedItem[] = []
  let current: GroupedItem | null = null
  let chapterCount = 0
  let subCount = 0

  for (const item of items) {
    const level = item.level ?? 0
    if (level === 0) {
      chapterCount++
      subCount = 0
      current = {
        title: item.title,
        segmentIndex: item.segmentIndex,
        num: `${chapterCount}`,
        children: [],
      }
      groups.push(current)
    } else {
      if (!current) {
        chapterCount++
        current = {
          title: item.title,
          segmentIndex: item.segmentIndex,
          num: `${chapterCount}`,
          children: [],
        }
        groups.push(current)
        continue
      }
      subCount++
      current.children.push({
        title: item.title,
        segmentIndex: item.segmentIndex,
        num: `${chapterCount}-${subCount}`,
      })
    }
  }

  return groups
}

export function TOCPanel({ items, onJump }: Props) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  if (items.length === 0) return null

  const groups = groupByChapter(items)

  const toggle = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const handleJump = (segmentIndex: number) => {
    onJump(segmentIndex)
    setOpen(false)
    setExpanded(new Set())
  }

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
            className="absolute right-0 top-full mt-1 z-50 w-80 max-h-[28rem] overflow-y-auto rounded-xl shadow-lg"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="py-1">
              <div
                className="text-xs font-semibold px-4 py-2"
                style={{ color: 'var(--text-muted)' }}
              >
                目录
              </div>

              {groups.map((group, i) => {
                const isOpen = expanded.has(i)
                const hasChildren = group.children.length > 0

                return (
                  <div key={i}>
                    {/* Chapter item */}
                    <div
                      className="flex items-center"
                      style={{
                        borderTop: i > 0 ? '1px solid var(--border-light)' : 'none',
                      }}
                    >
                      <button
                        onClick={() => handleJump(group.segmentIndex)}
                        className="flex-1 text-left px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--bg-secondary)]"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <span className="flex items-baseline gap-2">
                          <span
                            className="text-xs tabular-nums flex-shrink-0"
                            style={{ color: 'var(--accent)', minWidth: '1.5em' }}
                          >
                            {group.num}
                          </span>
                          <span className="truncate">{group.title}</span>
                        </span>
                      </button>

                      {hasChildren && (
                        <button
                          onClick={() => toggle(i)}
                          className="px-3 py-2.5 transition-colors hover:bg-[var(--bg-secondary)]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            style={{
                              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                            }}
                          >
                            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Sub-items */}
                    {isOpen && hasChildren && (
                      <div style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        {group.children.map((child, j) => (
                          <button
                            key={j}
                            onClick={() => handleJump(child.segmentIndex)}
                            className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-tertiary)]"
                            style={{ paddingLeft: '3rem' }}
                          >
                            <span className="flex items-baseline gap-2">
                              <span
                                className="text-xs tabular-nums flex-shrink-0"
                                style={{ color: 'var(--accent)', minWidth: '2em' }}
                              >
                                {child.num}
                              </span>
                              <span className="truncate" style={{ color: 'var(--text-secondary)' }}>
                                {child.title}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
