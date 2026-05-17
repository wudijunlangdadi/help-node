import { useState, useRef, useEffect, useCallback } from 'react'
import type { SegmentResult } from '../../stores/importStore'

interface Props {
  current: number
  total: number
  segments?: string[]
  segmentResults?: SegmentResult[]
  onJump?: (index: number) => void
}

export function SegmentProgress({ current, total, segments, segmentResults, onJump }: Props) {
  const [open, setOpen] = useState(false)
  const [hoverIndex, setHoverIndex] = useState(current)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  if (total <= 1) return null

  const resultMap = new Map<number, SegmentResult>()
  if (segmentResults) {
    for (const r of segmentResults) {
      resultMap.set(r.segmentIndex, r)
    }
  }

  const canSelect = segments && onJump

  const handleJump = useCallback((index: number) => {
    onJump?.(index)
    setOpen(false)
  }, [onJump])

  // Wheel on the progress bar: change segment directly
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!canSelect) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? 1 : -1
    const next = Math.max(0, Math.min(total - 1, current + delta))
    if (next !== current) {
      handleJump(next)
    }
  }, [canSelect, current, total, handleJump])

  // Wheel in the picker list: scroll through segments
  const handleListWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 1 : -1
    setHoverIndex((prev) => Math.max(0, Math.min(total - 1, prev + delta)))
  }, [total])

  // Click outside to close
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Sync hoverIndex when opening
  useEffect(() => {
    if (open) setHoverIndex(current)
  }, [open, current])

  // Auto-scroll the list to keep hoverIndex visible
  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.querySelector(`[data-seg="${hoverIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [hoverIndex, open])

  // Keyboard in picker
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHoverIndex((prev) => Math.max(0, prev - 1))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHoverIndex((prev) => Math.min(total - 1, prev + 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleJump(hoverIndex)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }, [open, hoverIndex, total, handleJump])

  const getPreview = (seg: string) => seg.replace(/\n/g, ' ').trim()

  return (
    <div className="relative" ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Progress bar - wheel to switch, click to open picker */}
      <button
        onClick={() => canSelect && setOpen(!open)}
        onWheel={handleWheel}
        className={`flex items-center gap-3 w-full ${canSelect ? 'cursor-pointer' : ''}`}
      >
        <span className="text-caption tabular-nums" style={{ minWidth: '5em' }}>
          {current + 1} / {total}
        </span>
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(current / total) * 100}%`,
              background: 'var(--accent)',
            }}
          />
        </div>
        {canSelect && (
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Picker list */}
      {open && segments && (
        <div
          ref={listRef}
          className="absolute left-0 top-full mt-1 z-50 w-80 overflow-y-auto rounded-xl shadow-lg"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            scrollbarWidth: 'thin',
            maxHeight: 'calc(5 * 2.25rem + 0.5rem)',
          }}
          onWheel={handleListWheel}
          tabIndex={0}
        >
          <div className="py-1">
            {segments.map((seg, i) => {
              const result = resultMap.get(i)
              const isCurrent = i === current
              const isHover = i === hoverIndex
              const preview = getPreview(seg)

              return (
                <button
                  key={i}
                  data-seg={i}
                  onClick={() => handleJump(i)}
                  onMouseEnter={() => setHoverIndex(i)}
                  className="w-full text-left px-3 text-xs transition-colors"
                  style={{
                    height: '2.25rem',
                    lineHeight: '2.25rem',
                    backgroundColor: isHover ? 'var(--accent)' : isCurrent ? 'var(--bg-tertiary)' : undefined,
                    color: isHover ? '#fff' : undefined,
                    borderLeft: isCurrent ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="tabular-nums flex-shrink-0 w-5 text-right"
                        style={{ color: isHover ? 'rgba(255,255,255,0.85)' : result ? 'var(--success)' : isCurrent ? 'var(--accent)' : 'var(--text-muted)' }}
                      >
                        {result ? '✓' : `${i + 1}`}
                      </span>
                      <span
                        className="truncate"
                        style={{ color: isHover ? '#fff' : isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                      >
                        {preview.slice(0, 40)}{preview.length > 40 ? '...' : ''}
                      </span>
                    </div>
                    {result && (
                      <span className="tabular-nums flex-shrink-0" style={{ color: isHover ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)' }}>
                        {result.result.wpm}wpm {result.result.accuracy}%
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}