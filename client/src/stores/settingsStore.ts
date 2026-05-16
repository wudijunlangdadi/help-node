import { create } from 'zustand'

interface SettingsState {
  fontSize: number
  setFontSize: (size: number) => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
}

const FONT_SIZE_MIN = 14
const FONT_SIZE_MAX = 32
const FONT_SIZE_DEFAULT = 18
const STORAGE_KEY = 'typeflow-settings'

function loadFontSize(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return clamp(parsed.fontSize ?? FONT_SIZE_DEFAULT, FONT_SIZE_MIN, FONT_SIZE_MAX)
    }
  } catch {}
  return FONT_SIZE_DEFAULT
}

function saveFontSize(fontSize: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontSize }))
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export const useSettingsStore = create<SettingsState>((set) => ({
  fontSize: loadFontSize(),

  setFontSize: (size) => {
    const clamped = clamp(size, FONT_SIZE_MIN, FONT_SIZE_MAX)
    saveFontSize(clamped)
    set({ fontSize: clamped })
  },

  increaseFontSize: () => {
    set((state) => {
      const clamped = clamp(state.fontSize + 2, FONT_SIZE_MIN, FONT_SIZE_MAX)
      saveFontSize(clamped)
      return { fontSize: clamped }
    })
  },

  decreaseFontSize: () => {
    set((state) => {
      const clamped = clamp(state.fontSize - 2, FONT_SIZE_MIN, FONT_SIZE_MAX)
      saveFontSize(clamped)
      return { fontSize: clamped }
    })
  },
}))
