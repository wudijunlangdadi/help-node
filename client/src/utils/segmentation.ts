import type { PracticeMode } from '../types'

export interface TOCItem {
  title: string
  segmentIndex: number
}

const DEFAULT_MAX_LENGTH: Record<PracticeMode, number> = {
  english: 300,
  chinese: 200,
  code: 250,
}

export function segmentText(
  text: string,
  mode: PracticeMode,
  maxSegmentLength?: number
): string[] {
  const maxLen = maxSegmentLength ?? DEFAULT_MAX_LENGTH[mode]

  if (text.length <= maxLen) {
    return [text]
  }

  let segments: string[]

  switch (mode) {
    case 'chinese':
      segments = splitChinese(text, maxLen)
      break
    case 'code':
      segments = splitCode(text, maxLen)
      break
    default:
      segments = splitEnglish(text, maxLen)
  }

  return segments.filter((s) => s.trim().length > 0)
}

function splitEnglish(text: string, maxLen: number): string[] {
  // 1. Split by paragraphs
  const paragraphs = text.split(/\n\n+/)
  return mergeSmallSegments(paragraphs, maxLen, (chunk) =>
    splitByRegex(chunk, maxLen, /(?<=[.!?])\s+(?=[A-Z])/)
  )
}

function splitChinese(text: string, maxLen: number): string[] {
  // 1. Split by paragraphs
  const paragraphs = text.split(/\n\n+/)
  return mergeSmallSegments(paragraphs, maxLen, (chunk) =>
    splitByRegex(chunk, maxLen, /(?<=[。！？；])\s*/)
  )
}

function splitCode(text: string, maxLen: number): string[] {
  // 1. Split by blank lines
  const blocks = text.split(/\n\s*\n/)
  return mergeSmallSegments(blocks, maxLen, (chunk) =>
    splitByRegex(chunk, maxLen, /(?<=\n)(?=(?:def |class |function |const |let |var |import |export ))/)
  )
}

function mergeSmallSegments(
  chunks: string[],
  maxLen: number,
  splitFurther: (chunk: string) => string[]
): string[] {
  const result: string[] = []
  let buffer = ''

  for (const chunk of chunks) {
    const trimmed = chunk.trim()
    if (!trimmed) continue

    if (buffer.length + trimmed.length + 1 <= maxLen) {
      buffer = buffer ? `${buffer}\n\n${trimmed}` : trimmed
    } else {
      if (buffer) {
        result.push(buffer)
      }
      if (trimmed.length <= maxLen) {
        buffer = trimmed
      } else {
        const subSegments = splitFurther(trimmed)
        for (let i = 0; i < subSegments.length - 1; i++) {
          result.push(subSegments[i].trim())
        }
        buffer = subSegments[subSegments.length - 1]?.trim() ?? ''
      }
    }
  }

  if (buffer) {
    result.push(buffer)
  }

  return result
}

function splitByRegex(text: string, maxLen: number, regex: RegExp): string[] {
  const parts = text.split(regex)
  const result: string[] = []
  let buffer = ''

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    if (buffer.length + trimmed.length + 1 <= maxLen) {
      buffer = buffer ? `${buffer} ${trimmed}` : trimmed
    } else {
      if (buffer) result.push(buffer)
      buffer = trimmed
    }
  }

  if (buffer) result.push(buffer)
  return result.length > 0 ? result : [text]
}

// TOC detection patterns by mode
const TOC_PATTERNS: Record<PracticeMode, RegExp[]> = {
  english: [
    /^(?:chapter|CHAPTER|Chapter)\s+[\dIVXLC]+/m,
    /^(?:part|PART|Part)\s+[\dIVXLC]+/m,
    /^(?:section|SECTION|Section)\s+[\dIVXLC]+/m,
    /^\d+\.\s+[A-Z]/m,
  ],
  chinese: [
    /^第[一二三四五六七八九十百千\d]+[章回节篇]/m,
    /^[一二三四五六七八九十]+[、.．]/m,
    /^\d+[、.．]\s*\S/m,
  ],
  code: [
    /^#{2,}\s+\S/m,
    /^={3,}\s*$/m,
    /^def\s+\w+/m,
    /^class\s+\w+/m,
  ],
}

export function detectTOC(text: string, mode: PracticeMode, segments: string[]): TOCItem[] {
  const patterns = TOC_PATTERNS[mode]
  const items: TOCItem[] = []
  const lines = text.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const isMatch = patterns.some((p) => p.test(trimmed))
    if (!isMatch) continue

    // Find which segment contains this line
    const lineIndex = text.indexOf(trimmed)
    if (lineIndex === -1) continue

    let segmentIndex = 0
    let charCount = 0
    for (let i = 0; i < segments.length; i++) {
      charCount += segments[i].length
      if (lineIndex < charCount) {
        segmentIndex = i
        break
      }
    }

    // Avoid duplicate segment entries
    if (items.length > 0 && items[items.length - 1].segmentIndex === segmentIndex) {
      continue
    }

    items.push({
      title: trimmed.length > 40 ? trimmed.substring(0, 40) + '...' : trimmed,
      segmentIndex,
    })
  }

  return items
}
