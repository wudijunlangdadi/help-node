// Load pdfjs-dist from CDN at runtime
let pdfjsLoaded = false

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

async function ensurePdfJs(): Promise<any> {
  if (!pdfjsLoaded) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.js')
    pdfjsLoaded = true
  }
  // pdfjsLib is exposed as a global by the UMD build
  const lib = (window as any).pdfjsLib
  if (!lib) throw new Error('pdf.js failed to load')
  lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js'
  return lib
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const lib = await ensurePdfJs()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await lib.getDocument({ data: arrayBuffer }).promise

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
