export async function exportQrAsPdf(
  dataUrl: string,
  filename: string,
  options?: { width?: number; height?: number; title?: string }
): Promise<void> {
  const width = options?.width ?? 595
  const height = options?.height ?? 842
  const title = options?.title ?? 'KUER Studio QR Code'

  // Generate a simple HTML-based print page as PDF placeholder
  // Real implementation would use jsPDF or server-side PDF generation
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @page { size: ${width}pt ${height}pt; margin: 0; }
        body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: white; }
        img { max-width: 80%; max-height: 80%; }
      </style>
    </head>
    <body>
      <img src="${dataUrl}" alt="QR Code" />
    </body>
    </html>
  `

  const blob = new Blob([html], { type: 'text/html' })
  const blobUrl = URL.createObjectURL(blob)
  const printWindow = window.open(blobUrl, '_blank')
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print()
      URL.revokeObjectURL(blobUrl)
    }
  }
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
