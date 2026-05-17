import { create } from 'zustand'
import type { PracticeMode, TypingResult } from '../types'
import { segmentText } from '../utils/segmentation'
import type { SegmentResult as SavedSegmentResult } from './importStore'

export interface SegmentResult {
  segmentIndex: number
  text: string
  result: TypingResult
  completedAt: string
}

interface SessionState {
  segments: string[]
  currentSegmentIndex: number
  articleId: string | null
  importId: string | null
  articleTitle: string
  mode: PracticeMode
  segmentResults: SegmentResult[]
  isComplete: boolean

  initSession: (text: string, mode: PracticeMode, articleId: string | null, articleTitle: string) => void
  resumeFromSegment: (index: number) => void
  restoreSegmentResults: (saved: SavedSegmentResult[]) => void
  setImportId: (id: string) => void
  completeSegment: (result: TypingResult) => void
  resetSession: () => void
  getAggregateResult: () => TypingResult | null
  getCurrentSegment: () => string
  getTotalSegments: () => number
}

export const useSessionStore = create<SessionState>((set, get) => ({
  segments: [],
  currentSegmentIndex: 0,
  articleId: null,
  importId: null,
  articleTitle: '',
  mode: 'english',
  segmentResults: [],
  isComplete: false,

  initSession: (text, mode, articleId, articleTitle) => {
    const segments = segmentText(text, mode)
    set({
      segments,
      currentSegmentIndex: 0,
      articleId,
      importId: null,
      articleTitle,
      mode,
      segmentResults: [],
      isComplete: false,
    })
  },

  resumeFromSegment: (index) => {
    set((state) => ({
      currentSegmentIndex: Math.min(index, state.segments.length - 1),
    }))
  },

  restoreSegmentResults: (saved) => {
    set((state) => {
      const results: SegmentResult[] = saved.map((s) => ({
        segmentIndex: s.segmentIndex,
        text: state.segments[s.segmentIndex] ?? '',
        result: s.result,
        completedAt: s.completedAt,
      }))
      return { segmentResults: results }
    })
  },

  setImportId: (id) => set({ importId: id }),

  completeSegment: (result) => {
    const state = get()
    const segmentResult: SegmentResult = {
      segmentIndex: state.currentSegmentIndex,
      text: state.segments[state.currentSegmentIndex],
      result,
      completedAt: new Date().toISOString(),
    }
    const newResults = [...state.segmentResults, segmentResult]
    const nextIndex = state.currentSegmentIndex + 1
    const isComplete = nextIndex >= state.segments.length

    set({
      segmentResults: newResults,
      currentSegmentIndex: nextIndex,
      isComplete,
    })
  },

  resetSession: () => {
    set({
      segments: [],
      currentSegmentIndex: 0,
      articleId: null,
      importId: null,
      articleTitle: '',
      mode: 'english',
      segmentResults: [],
      isComplete: false,
    })
  },

  getAggregateResult: () => {
    const { segmentResults } = get()
    if (segmentResults.length === 0) return null

    let totalCorrect = 0
    let totalKeystrokes = 0
    let totalDuration = 0
    let totalErrorCount = 0
    const mergedErrors: Record<string, number> = {}

    for (const sr of segmentResults) {
      totalCorrect += sr.result.correctChars
      totalKeystrokes += sr.result.totalKeystrokes
      totalDuration += sr.result.duration
      totalErrorCount += sr.result.errorCount
      for (const [char, count] of Object.entries(sr.result.errorChars)) {
        mergedErrors[char] = (mergedErrors[char] || 0) + count
      }
    }

    const accuracy = totalKeystrokes > 0
      ? Math.round((totalCorrect / totalKeystrokes) * 1000) / 10
      : 100
    const wpm = totalDuration > 0
      ? Math.round((totalCorrect / 5) / (totalDuration / 60))
      : 0

    return {
      wpm,
      accuracy,
      errorCount: totalErrorCount,
      duration: totalDuration,
      errorChars: mergedErrors,
      correctChars: totalCorrect,
      totalKeystrokes,
    }
  },

  getCurrentSegment: () => {
    const { segments, currentSegmentIndex } = get()
    return segments[currentSegmentIndex] ?? ''
  },

  getTotalSegments: () => get().segments.length,
}))
