import { useEffect, useCallback, useRef } from 'react'
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
    restoreSegmentResults,
    setImportId,
    completeSegment,
    resetSession,
    articleTitle: sessionTitle,
    mode: sessionMode,
  } = useSessionStore()

  // Use specific selectors to avoid re-render loops (full store object changes on every update)
  const getText = useImportStore((s) => s.getText)
  const updateProgress = useImportStore((s) => s.updateProgress)
  const saveSegmentResult = useImportStore((s) => s.saveSegmentResult)

  // Non-reactive reads — use getState() to avoid subscribing to store changes
  const importedText = importId ? useImportStore.getState().getText(importId) : undefined
  const tocItems = importedText?.tocItems ?? []

  // Reactive read for segment results (updates when saveSegmentResult is called)
  const segmentResults = useImportStore((s) => importId ? s.texts.find((t) => t.id === importId)?.segmentResults : undefined)

  const initializedRef = useRef(false)
  const currentCharIndexRef = useRef(0)

  useEffect(() => {
    if (initializedRef.current) return

    if (importId) {
      // Use getState() for one-time read, not a reactive subscription
      const imported = useImportStore.getState().getText(importId)
      if (!imported) {
        navigate(`/articles/${mode}`)
        return
      }
      setImportId(importId)
      initSession(imported.content, imported.mode, null, imported.title)
      if (imported.segmentResults?.length > 0) {
        restoreSegmentResults(imported.segmentResults)
      }
      if (imported.lastSegmentIndex > 0) {
        resumeFromSegment(imported.lastSegmentIndex)
      }
      // Restore char position within the segment
      if (imported.lastCharIndex > 0) {
        currentCharIndexRef.current = imported.lastCharIndex
      }
      initializedRef.current = true
    } else {
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
  }, [importId, customText, selectedArticleId, mode, navigate, initSession, resumeFromSegment, restoreSegmentResults, setImportId, articleTitle])

  // Navigate to result page when all segments are done
  useEffect(() => {
    if (isComplete && segments.length > 0) {
      navigate('/practice/result', { replace: true })
    }
  }, [isComplete, segments.length, navigate])

  // Save progress on unmount (user navigates away)
  useEffect(() => {
    return () => {
      if (importId) {
        // Use getState() for non-reactive write on unmount
        useImportStore.getState().updateProgress(importId, currentSegmentIndex, currentCharIndexRef.current)
      }
    }
  }, [importId, currentSegmentIndex])

  const handleFinish = useCallback((result: TypingResult) => {
    completeSegment(result)
    if (importId) {
      saveSegmentResult(importId, currentSegmentIndex, result)
      updateProgress(importId, currentSegmentIndex + 1, 0)
    }
  }, [completeSegment, importId, currentSegmentIndex, updateProgress, saveSegmentResult])

  const handleProgress = useCallback((currentIndex: number) => {
    currentCharIndexRef.current = currentIndex
  }, [])

  const handleJumpToSegment = useCallback((index: number) => {
    resumeFromSegment(index)
  }, [resumeFromSegment])

  const handleBack = () => {
    // Progress is saved by the unmount effect
    const backMode = sessionMode || mode
    resetSession()
    resetPractice()
    navigate(`/articles/${backMode}`)
  }

  const currentSegment = segments[currentSegmentIndex]

  // Show loading only while segments haven't been initialized yet
  if (segments.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-caption">加载中...</p>
      </div>
    )
  }

  if (!currentSegment) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-caption">加载中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="text-caption flex items-center gap-1 hover:opacity-70 transition-opacity"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          返回
        </button>
        <h2 className="heading-serif text-sm truncate max-w-[50%] text-center" style={{ color: 'var(--text-primary)' }}>
          {sessionTitle}
        </h2>
        <div className="flex items-center gap-1.5">
          {tocItems.length > 0 && (
            <TOCPanel items={tocItems} onJump={handleJumpToSegment} />
          )}
          <FontSizeControl />
        </div>
      </div>

      {/* Segment progress */}
      <div className="mb-5">
        <SegmentProgress
          current={currentSegmentIndex}
          total={segments.length}
          segments={importId ? segments : undefined}
          segmentResults={segmentResults}
          onJump={importId ? handleJumpToSegment : undefined}
        />
      </div>

      {/* Typing area */}
      <TypingArea
        key={currentSegmentIndex}
        text={currentSegment}
        mode={mode}
        onFinish={handleFinish}
        initialIndex={importedText?.lastCharIndex}
        onProgress={handleProgress}
      />
    </div>
  )
}
