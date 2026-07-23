import { jsPDF } from 'jspdf'

interface PdfOptions {
  width?: number
  height?: number
  title?: string
}

function imageFormat(dataUrl: string): 'PNG' | 'JPEG' | 'WEBP' {
  if (dataUrl.startsWith('data:image/jpeg')) return 'JPEG'
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP'
  return 'PNG'
}

export function createQrPdfBytes(
  dataUrl: string,
  options: PdfOptions = {}
): ArrayBuffer {
  const width = options.width ?? 595
  const height = options.height ?? 842
  const document = new jsPDF({
    orientation: width > height ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [width, height],
    compress: true,
  })
  document.setProperties({ title: options.title ?? 'KUER Studio QR Code' })

  const side = Math.min(width, height) * 0.8
  const x = (width - side) / 2
  const y = (height - side) / 2
  document.addImage(dataUrl, imageFormat(dataUrl), x, y, side, side, undefined, 'FAST')

  return document.output('arraybuffer')
}

export async function exportQrAsPdf(
  dataUrl: string,
  filename: string,
  options?: PdfOptions
): Promise<void> {
  const bytes = createQrPdfBytes(dataUrl, options)
  const blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(blobUrl)
}

export async function exportQrAsPrintReadyPdf(
  dataUrl: string,
  filename: string
): Promise<void> {
  return exportQrAsPdf(dataUrl, filename, {
    width: 595,
    height: 842,
    title: `${filename} - Print Ready`,
  })
}
