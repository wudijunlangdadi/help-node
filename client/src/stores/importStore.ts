import { create } from 'zustand'
import type { PracticeMode, TypingResult } from '../types'
import { segmentText, detectTOC, type TOCItem } from '../utils/segmentation'
import { normalizeText } from '../utils/textNormalize'

export interface SegmentResult {
  segmentIndex: number
  result: TypingResult
  completedAt: string
}

export interface ImportedText {
  id: string
  title: string
  content: string
  mode: PracticeMode
  importedAt: string
  lastSegmentIndex: number
  lastCharIndex: number
  totalSegments: number
  tocItems: TOCItem[]
  segmentResults: SegmentResult[]
}

interface ImportState {
  texts: ImportedText[]
  addText: (title: string, content: string, mode: PracticeMode, pdfTocItems?: TOCItem[]) => string
  removeText: (id: string) => void
  updateProgress: (id: string, segmentIndex: number, charIndex?: number) => void
  saveSegmentResult: (id: string, segmentIndex: number, result: TypingResult) => void
  getText: (id: string) => ImportedText | undefined
}

const STORAGE_KEY = 'typeflow-imported-texts'

function loadTexts(): ImportedText[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const texts: ImportedText[] = saved ? JSON.parse(saved) : []
    // Migrate old data: ensure segmentResults exists
    return texts.map((t) => ({ ...t, segmentResults: t.segmentResults ?? [] }))
  } catch {
    return []
  }
}

function saveTexts(texts: ImportedText[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(texts))
}

export const useImportStore = create<ImportState>((set, get) => ({
  texts: loadTexts(),

  addText: (title, content, mode, pdfTocItems) => {
    const normalizedContent = normalizeText(content)
    const segments = segmentText(normalizedContent, mode)
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

    // Use PDF outline if available, otherwise detect from text
    let tocItems: TOCItem[]
    if (pdfTocItems && pdfTocItems.length > 0) {
      // Convert charOffset to segmentIndex
      tocItems = pdfTocItems.map((item) => {
        let charCount = 0
        let segmentIndex = 0
        for (let i = 0; i < segments.length; i++) {
          charCount += segments[i].length
          if (item.charOffset! < charCount) {
            segmentIndex = i
            break
          }
          segmentIndex = i
        }
        return { title: item.title, segmentIndex, level: item.level }
      })
    } else {
      tocItems = detectTOC(normalizedContent, mode, segments)
    }

    const newText: ImportedText = {
      id,
      title,
      content: normalizedContent,
      mode,
      importedAt: new Date().toISOString(),
      lastSegmentIndex: 0,
      lastCharIndex: 0,
      totalSegments: segments.length,
      tocItems,
      segmentResults: [],
    }

    set((state) => {
      const updated = [newText, ...state.texts]
      saveTexts(updated)
      return { texts: updated }
    })

    return id
  },

  removeText: (id) => {
    set((state) => {
      const updated = state.texts.filter((t) => t.id !== id)
      saveTexts(updated)
      return { texts: updated }
    })
  },

  updateProgress: (id, segmentIndex, charIndex) => {
    set((state) => {
      const updated = state.texts.map((t) =>
        t.id === id ? { ...t, lastSegmentIndex: segmentIndex, lastCharIndex: charIndex ?? 0 } : t
      )
      saveTexts(updated)
      return { texts: updated }
    })
  },

  saveSegmentResult: (id, segmentIndex, result) => {
    set((state) => {
      const updated = state.texts.map((t) => {
        if (t.id !== id) return t
        const existing = (t.segmentResults ?? []).filter((r) => r.segmentIndex !== segmentIndex)
        const newResult: SegmentResult = {
          segmentIndex,
          result,
          completedAt: new Date().toISOString(),
        }
        return { ...t, segmentResults: [...existing, newResult] }
      })
      saveTexts(updated)
      return { texts: updated }
    })
  },

  getText: (id) => get().texts.find((t) => t.id === id),
}))
