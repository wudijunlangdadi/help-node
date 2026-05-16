import * as pdfjsLib from 'pdfjs-dist'

// Import worker URL using Vite's ?url suffix
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.js?url'

// Set the worker source explicitly
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    isEvalSupported: false,
  }).promise

  const textParts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: any) => item.str)
      .join('')
    if (pageText.trim()) {
      textParts.push(pageText.trim())
    }
  }

  return textParts.join('\n\n')
}
