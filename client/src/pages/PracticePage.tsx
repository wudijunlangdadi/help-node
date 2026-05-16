import { useEffect, useCallback, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TypingArea } from '../components/TypingEngine/TypingArea'
import { FontSizeControl } from '../components/Practice/FontSizeControl'
import { SegmentProgress } from '../components/Practice/SegmentProgress'
import { TOCPanel } from '../components/Practice/TOCPanel'
import { usePracticeStore } from '../stores/practiceStore'
import { useSessionStore } from '../stores/sessionStore'
import { useImportStore } from '../stores/importStore'
import { findArticleById } from '../data/builtinArticles'
import type { TypingResult } from '../types'

export default function PracticePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const importId = searchParams.get('importId')

  const { mode, selectedArticleId, articleTitle, customText, reset: resetPractice } = usePracticeStore()
  const {
    segments,
    currentSegmentIndex,
    isComplete,
    initSession,
    resumeFromSegment,
    setImportId,
    completeSegment,
    resetSession,
    articleTitle: sessionTitle,
  } = useSessionStore()
  const importStore = useImportStore()

  const [key, setKey] = useState(0)
  const initializedRef = useRef(false)

  // Initialize session
  useEffect(() => {
    if (initializedRef.current) return

    if (importId) {
      // Loading from import store
      const imported = importStore.getText(importId)
      if (!imported) {
        navigate(`/articles/${mode}`)
        return
      }

      setImportId(importId)
      initSession(imported.content, imported.mode, null, imported.title)

      // Resume from last position
      if (imported.lastSegmentIndex > 0) {
        // Need to wait for segments to be set, then resume
        setTimeout(() => {
          resumeFromSegment(imported.lastSegmentIndex)
          setKey((k) => k + 1)
        }, 0)
      }

      initializedRef.current = true
    } else {
      // Loading from built-in article or custom text
      let text = ''
      let title = articleTitle

      if (customText) {
        text = customText
        title = '自定义文本'
      } else if (selectedArticleId) {
        const article = findArticleById(selectedArticleId)
        if (article) {
          text = article.content
          title = article.title
        }
      }

      if (!text) {
        navigate(`/articles/${mode}`)
        return
      }

      initSession(text, mode, selectedArticleId, title)
      initializedRef.current = true
    }
  }, [importId, customText, selectedArticleId, mode, navigate, initSession, resumeFromSegment, setImportId, articleTitle, importStore])

  // Navigate to result page when all segments complete
  useEffect(() => {
    if (isComplete && segments.length > 0) {
      const timer = setTimeout(() => {
        navigate('/practice/result')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isComplete, segments.length, navigate])

  const handleFinish = useCallback((result: TypingResult) => {
    completeSegment(result)

    // Save progress to importStore if applicable
    if (importId) {
      importStore.updateProgress(importId, currentSegmentIndex + 1)
    }

    setKey((k) => k + 1)
  }, [completeSegment, importId, currentSegmentIndex, importStore])

  const handleJumpToSegment = useCallback((index: number) => {
    resumeFromSegment(index)
    setKey((k) => k + 1)
  }, [resumeFromSegment])

  const handleBack = () => {
    resetSession()
    resetPractice()
    navigate(importId ? `/articles/${mode}` : `/articles/${mode}`)
  }

  const currentSegment = segments[currentSegmentIndex]
  const tocItems = importId ? (importStore.getText(importId)?.tocItems ?? []) : []

  if (!currentSegment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p style={{ color: 'var(--text-muted)' }}>加载中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleBack}
          className="text-sm flex items-center gap-1 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          ← 返回
        </button>
        <div className="text-sm font-medium truncate max-w-[50%]" style={{ color: 'var(--text-primary)' }}>
          {sessionTitle}
        </div>
        <div className="flex items-center gap-2">
          {tocItems.length > 0 && (
            <TOCPanel items={tocItems} onJump={handleJumpToSegment} />
          )}
          <FontSizeControl />
        </div>
      </div>

      {/* Segment progress */}
      <div className="mb-4">
        <SegmentProgress current={currentSegmentIndex} total={segments.length} />
      </div>

      {/* Typing area */}
      <TypingArea
        key={`${key}-${currentSegmentIndex}`}
        text={currentSegment}
        mode={mode}
        onFinish={handleFinish}
      />
    </div>
  )
}
