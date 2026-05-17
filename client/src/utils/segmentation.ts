import type { PracticeMode } from '../types'

export interface TOCItem {
  title: string
  segmentIndex: number
  charOffset?: number // Used by PDF outline to map to segments
  level?: number // Hierarchy depth: 0 = chapter, 1 = section, 2 = subsection
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
  // Split by paragraphs, preserving newlines within
  const paragraphs = text.split(/\n\n+/)
  return mergeSmallSegments(paragraphs, maxLen, (chunk) =>
    splitByRegex(chunk, maxLen, /(?<=[.!?])\s+(?=[A-Z])/)
  , '\n\n')
}

function splitChinese(text: string, maxLen: number): string[] {
  const paragraphs = text.split(/\n\n+/)
  return mergeSmallSegments(paragraphs, maxLen, (chunk) =>
    splitByRegex(chunk, maxLen, /(?<=[。！？；])\s*/)
  , '\n\n')
}

function splitCode(text: string, maxLen: number): string[] {
  const blocks = text.split(/\n\s*\n/)
  return mergeSmallSegments(blocks, maxLen, (chunk) =>
    splitByRegex(chunk, maxLen, /(?<=\n)(?=(?:def |class |function |const |let |var |import |export ))/)
  , '\n\n')
}

function mergeSmallSegments(
  chunks: string[],
  maxLen: number,
  splitFurther: (chunk: string) => string[],
  separator: string = '\n\n'
): string[] {
  const result: string[] = []
  let buffer = ''

  for (const chunk of chunks) {
    const trimmed = chunk.trim()
    if (!trimmed) continue

    if (buffer.length + trimmed.length + separator.length <= maxLen) {
      buffer = buffer ? `${buffer}${separator}${trimmed}` : trimmed
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

    const sep = buffer.endsWith('\n') ? '' : ' '
    if (buffer.length + trimmed.length + sep.length <= maxLen) {
      buffer = buffer ? `${buffer}${sep}${trimmed}` : trimmed
    } else {
      if (buffer) result.push(buffer)
      buffer = trimmed
    }
  }

  if (buffer) result.push(buffer)
  return result.length > 0 ? result : [text]
}

// TOC detection patterns by mode, with level: 0 = chapter, 1 = section, 2 = subsection
const TOC_PATTERNS: Record<PracticeMode, { regex: RegExp; level: number }[]> = {
  english: [
    { regex: /^(?:chapter|CHAPTER|Chapter)\s+[\dIVXLC]+/, level: 0 },
    { regex: /^(?:part|PART|Part)\s+[\dIVXLC]+/, level: 0 },
    { regex: /^(?:section|SECTION|Section)\s+[\dIVXLC]+/, level: 1 },
    { regex: /^\d+\.\d+\.\d+\s+/, level: 2 },
    { regex: /^\d+\.\d+\s+/, level: 1 },
    { regex: /^\d+\.\s+[A-Z]/, level: 1 },
  ],
  chinese: [
    { regex: /^第[一二三四五六七八九十百千\d]+[章回篇]/, level: 0 },
    { regex: /^第[一二三四五六七八九十百千\d]+[节]/, level: 1 },
    { regex: /^[一二三四五六七八九十]+[、.．]/, level: 1 },
    { regex: /^\d+\.\d+\.\d+[\s.．]/, level: 2 },
    { regex: /^\d+\.\d+[\s.．]/, level: 1 },
    { regex: /^\d+[、.．]\s*\S/, level: 1 },
  ],
  code: [
    { regex: /^#{2}\s+\S/, level: 0 },
    { regex: /^#{3}\s+\S/, level: 1 },
    { regex: /^={3,}\s*$/, level: 0 },
    { regex: /^def\s+\w+/, level: 1 },
    { regex: /^class\s+\w+/, level: 0 },
  ],
}

export function detectTOC(text: string, mode: PracticeMode, segments: string[]): TOCItem[] {
  const patterns = TOC_PATTERNS[mode]
  const items: TOCItem[] = []
  const lines = text.split('\n')

  // Pre-process: join standalone numbers with their title on the next line (PDF TOC format)
  const mergedLines: { text: string; sourceIndex: number }[] = []
  let i = 0
  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (!trimmed) { i++; continue }

    // Standalone section numbers (from PDF TOC extraction): "2.1", "2.1.1", "3"
    // Combine with the next non-empty line as title
    const isStandaloneSubsection = /^\d+\.\d+\.\d+$/.test(trimmed)
    const isStandaloneSection = /^\d+\.\d+$/.test(trimmed)
    const isStandaloneChapter = /^\d+$/.test(trimmed) && parseInt(trimmed) <= 50

    if (isStandaloneSubsection || isStandaloneSection || (isStandaloneChapter && mode === 'chinese')) {
      // Look ahead for the next non-empty, non-number, non-dot-leader line
      let j = i + 1
      while (j < lines.length) {
        const next = lines[j].trim()
        if (!next) { j++; continue }
        // Skip dot leaders and page numbers
        if (/^[.\s·]+$/.test(next) || /^\d+$/.test(next)) { j++; continue }
        // Found a title
        mergedLines.push({ text: `${trimmed} ${next}`, sourceIndex: i })
        i = j + 1
        break
      }
      if (j >= lines.length) {
        mergedLines.push({ text: trimmed, sourceIndex: i })
        i++
      }
      continue
    }

    mergedLines.push({ text: trimmed, sourceIndex: i })
    i++
  }

  for (const { text: lineText, sourceIndex } of mergedLines) {
    const trimmed = lineText.trim()
    if (!trimmed) continue

    // Find the first matching pattern and its level
    let level = -1
    for (const p of patterns) {
      if (p.regex.test(trimmed)) {
        level = p.level
        break
      }
    }
    if (level === -1) continue

    // Find which segment contains this line using the source line index
    const charOffset = lines.slice(0, sourceIndex).join('\n').length + (sourceIndex > 0 ? 1 : 0)

    let segmentIndex = 0
    let charCount = 0
    for (let si = 0; si < segments.length; si++) {
      charCount += segments[si].length
      if (charOffset < charCount) {
        segmentIndex = si
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
      level,
    })
  }

  return items
}
