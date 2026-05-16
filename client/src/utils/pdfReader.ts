import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.js?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

interface TextItem {
  str: string
  transform: number[]
  width: number
  height: number
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    isEvalSupported: false,
  }).promise

  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const items = content.items as TextItem[]

    if (items.length === 0) continue

    // Group items by their Y position (same line)
    const lines: { y: number; items: { x: number; str: string }[] }[] = []

    for (const item of items) {
      if (!item.str.trim()) continue

      // transform: [scaleX, skewX, skewY, scaleY, translateX, translateY]
      const x = item.transform[4]
      const y = item.transform[5]

      // Find existing line at similar Y position (within 2px tolerance)
      const existingLine = lines.find((l) => Math.abs(l.y - y) < 2)

      if (existingLine) {
        existingLine.items.push({ x, str: item.str })
      } else {
        lines.push({ y, items: [{ x, str: item.str }] })
      }
    }

    // Sort lines top to bottom (Y is inverted in PDF coordinates)
    lines.sort((a, b) => b.y - a.y)

    // Sort items within each line left to right
    const pageLines: string[] = []

    for (const line of lines) {
      line.items.sort((a, b) => a.x - b.x)

      // Build line text with spacing based on X gaps
      let lineText = ''
      let lastX = 0

      for (let j = 0; j < line.items.length; j++) {
        const item = line.items[j]
        const gap = item.x - lastX

        if (j > 0 && gap > 20) {
          // Significant gap = space or tab
          if (gap > 80) {
            lineText += '    ' // Large gap = tab/indent
          } else {
            lineText += ' '
          }
        }

        lineText += item.str
        lastX = item.x + item.str.length * 6 // Approximate end position
      }

      pageLines.push(lineText)
    }

    pages.push(pageLines.join('\n'))
  }

  return pages.join('\n\n')
}
