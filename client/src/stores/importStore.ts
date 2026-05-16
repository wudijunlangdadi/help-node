import { create } from 'zustand'
import type { PracticeMode } from '../types'
import { segmentText, detectTOC, type TOCItem } from '../utils/segmentation'

export interface ImportedText {
  id: string
  title: string
  content: string
  mode: PracticeMode
  importedAt: string
  lastSegmentIndex: number
  totalSegments: number
  tocItems: TOCItem[]
}

interface ImportState {
  texts: ImportedText[]
  addText: (title: string, content: string, mode: PracticeMode) => string
  removeText: (id: string) => void
  updateProgress: (id: string, segmentIndex: number) => void
  getText: (id: string) => ImportedText | undefined
}

const STORAGE_KEY = 'typeflow-imported-texts'

function loadTexts(): ImportedText[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveTexts(texts: ImportedText[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(texts))
}

export const useImportStore = create<ImportState>((set, get) => ({
  texts: loadTexts(),

  addText: (title, content, mode) => {
    const segments = segmentText(content, mode)
    const tocItems = detectTOC(content, mode, segments)
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

    const newText: ImportedText = {
      id,
      title,
      content,
      mode,
      importedAt: new Date().toISOString(),
      lastSegmentIndex: 0,
      totalSegments: segments.length,
      tocItems,
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

  updateProgress: (id, segmentIndex) => {
    set((state) => {
      const updated = state.texts.map((t) =>
        t.id === id ? { ...t, lastSegmentIndex: segmentIndex } : t
      )
      saveTexts(updated)
      return { texts: updated }
    })
  },

  getText: (id) => get().texts.find((t) => t.id === id),
}))
