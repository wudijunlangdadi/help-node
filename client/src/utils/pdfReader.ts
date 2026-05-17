import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.js?url'
import type { TOCItem } from './segmentation'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

interface TextItem {
  str: string
  transform: number[]
  width: number
  height: number
}

interface OutlineItem {
  title: string
  dest: any
  items: OutlineItem[]
}

export interface PDFResult {
  text: string
  tocItems: TOCItem[]
}

// Resolve outline destination to page number
async function resolvePageNumber(pdf: any, dest: any): Promise<number> {
  try {
    let resolvedDest = dest
    if (typeof dest === 'string') {
      resolvedDest = await pdf.getDestination(dest)
    }
    if (!resolvedDest || !resolvedDest[0]) return -1
    const pageRef = resolvedDest[0]
    const pageIndex = await pdf.getPageIndex(pageRef)
    return pageIndex // 0-based page index
  } catch {
    return -1
  }
}

// Flatten outline tree into TOCItem array with page numbers and hierarchy level
async function flattenOutline(pdf: any, items: OutlineItem[], level = 0): Promise<{ title: string; pageIndex: number; level: number }[]> {
  const result: { title: string; pageIndex: number; level: number }[] = []

  for (const item of items) {
    const pageIndex = await resolvePageNumber(pdf, item.dest)
    if (pageIndex >= 0) {
      result.push({ title: item.title.trim(), pageIndex, level })
    }
    if (item.items && item.items.length > 0) {
      const children = await flattenOutline(pdf, item.items, level + 1)
      result.push(...children)
    }
  }

  return result
}

export async function extractTextFromPDF(file: File): Promise<PDFResult> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    isEvalSupported: false,
  }).promise

  // Extract text page by page, tracking page boundaries
  const pages: string[] = []
  const pageOffsets: number[] = [] // cumulative char offset for each page

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const items = content.items as TextItem[]

    if (items.length === 0) {
      pageOffsets.push(pages.join('\n\n').length)
      continue
    }

    // Group items by Y position (same line)
    const lines: { y: number; items: { x: number; str: string }[] }[] = []

    for (const item of items) {
      if (!item.str.trim()) continue
      const x = item.transform[4]
      const y = item.transform[5]
      const existingLine = lines.find((l) => Math.abs(l.y - y) < 2)
      if (existingLine) {
        existingLine.items.push({ x, str: item.str })
      } else {
        lines.push({ y, items: [{ x, str: item.str }] })
      }
    }

    // Sort lines top to bottom
    lines.sort((a, b) => b.y - a.y)

    const pageLines: string[] = []
    for (const line of lines) {
      line.items.sort((a, b) => a.x - b.x)
      let lineText = ''
      let lastX = 0
      for (let j = 0; j < line.items.length; j++) {
        const item = line.items[j]
        const gap = item.x - lastX
        if (j > 0 && gap > 20) {
          lineText += gap > 80 ? '    ' : ' '
        }
        lineText += item.str
        lastX = item.x + item.str.length * 6
      }
      pageLines.push(lineText)
    }

    const pageText = pageLines.join('\n')
    pageOffsets.push(pages.join('\n\n').length)
    pages.push(pageText)
  }

  const fullText = pages.join('\n\n')

  // Extract TOC from PDF outline (bookmarks)
  let tocItems: TOCItem[] = []
  try {
    const outline = await pdf.getOutline()
    if (outline && outline.length > 0) {
      const flatOutline = await flattenOutline(pdf, outline)

      // Map page indices to character offsets in the full text
      for (const { title, pageIndex, level } of flatOutline) {
        if (pageIndex < pageOffsets.length) {
          const charOffset = pageOffsets[pageIndex]
          tocItems.push({
            title: title.length > 50 ? title.substring(0, 50) + '...' : title,
            segmentIndex: 0, // Will be recalculated in importStore
            charOffset,
            level,
          })
        }
      }
    }
  } catch {
    // PDF has no outline, that's fine
  }

  return { text: fullText, tocItems }
}
