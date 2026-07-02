export async function exportCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename: string,
  targetWidth?: number
): Promise<void> {
  let exportCanvas = canvas
  if (targetWidth && targetWidth !== canvas.width) {
    exportCanvas = document.createElement('canvas')
    exportCanvas.width = targetWidth
    exportCanvas.height = targetWidth
    const ctx = exportCanvas.getContext('2d')!
    ctx.drawImage(canvas, 0, 0, targetWidth, targetWidth)
  }

  const dataUrl = exportCanvas.toDataURL('image/png')
  downloadDataUrl(dataUrl, filename)
}

export function exportDataUrlAsPng(dataUrl: string, filename: string): void {
  downloadDataUrl(dataUrl, filename)
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  targetWidth?: number
): Promise<string> {
  if (!targetWidth || targetWidth === canvas.width) {
    return canvas.toDataURL('image/png')
  }
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = targetWidth
  exportCanvas.height = targetWidth
  const ctx = exportCanvas.getContext('2d')!
  ctx.drawImage(canvas, 0, 0, targetWidth, targetWidth)
  return exportCanvas.toDataURL('image/png')
}
