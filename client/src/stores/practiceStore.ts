import { create } from 'zustand'
import type { PracticeMode } from '../types'

interface PracticeState {
  mode: PracticeMode
  selectedArticleId: string | null
  articleTitle: string
  customText: string | null
  setMode: (mode: PracticeMode) => void
  setSelectedArticle: (id: string | null, title?: string) => void
  setCustomText: (text: string | null) => void
  reset: () => void
}

export const usePracticeStore = create<PracticeState>((set) => ({
  mode: 'english',
  selectedArticleId: null,
  articleTitle: '',
  customText: null,

  setMode: (mode) => set({ mode }),
  setSelectedArticle: (id, title) => set({ selectedArticleId: id, articleTitle: title ?? '' }),
  setCustomText: (text) => set({ customText: text }),
  reset: () => set({ selectedArticleId: null, articleTitle: '', customText: null }),
}))
