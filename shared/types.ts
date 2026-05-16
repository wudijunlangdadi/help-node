// ==================== User ====================
export interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

// ==================== Article ====================
export type PracticeMode = 'english' | 'chinese' | 'code'
export type ArticleSource = 'builtin' | 'user'

export interface Article {
  id: string
  title: string
  content: string
  mode: PracticeMode
  language: string
  source: ArticleSource
  userId?: string
  createdAt: string
}

// ==================== Document ====================
export type FileType = 'txt' | 'pdf' | 'docx'

export interface Document {
  id: string
  userId: string
  title: string
  content: string
  fileType: FileType
  mode: PracticeMode
  createdAt: string
}

// ==================== Practice ====================
export interface PracticeRecord {
  id: string
  userId: string
  articleId?: string
  mode: PracticeMode
  wpm: number
  accuracy: number
  errorCount: number
  duration: number
  errorChars: Record<string, number>
  createdAt: string
}

export interface SavePracticeRequest {
  articleId?: string
  mode: PracticeMode
  wpm: number
  accuracy: number
  errorCount: number
  duration: number
  errorChars: Record<string, number>
}

// ==================== Stats ====================
export interface DashboardStats {
  totalPractices: number
  totalDuration: number
  avgWpm: number
  avgAccuracy: number
  bestWpm: number
  bestAccuracy: number
  recentPractices: PracticeRecord[]
  wpmTrend: { date: string; wpm: number }[]
  accuracyTrend: { date: string; accuracy: number }[]
  topErrors: { char: string; count: number }[]
  modeStats: { mode: PracticeMode; count: number; avgWpm: number; avgAccuracy: number }[]
}

// ==================== Typing Engine ====================
export type TypingStatus = 'idle' | 'typing' | 'finished'

export interface TypingState {
  status: TypingStatus
  text: string
  currentIndex: number
  correctChars: number
  errorChars: number
  totalKeystrokes: number
  startTime: number | null
  endTime: number | null
  errors: Record<string, number>
  wpm: number
  accuracy: number
  charStates: CharState[]
  typedChars: string[] // Track what user actually typed at each position
}

export type CharState = 'pending' | 'correct' | 'error' | 'current'

export interface TypingResult {
  wpm: number
  accuracy: number
  errorCount: number
  duration: number
  errorChars: Record<string, number>
  correctChars: number
  totalKeystrokes: number
}

// ==================== Theme ====================
export type Theme = 'light' | 'dark'

// ==================== API ====================
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
