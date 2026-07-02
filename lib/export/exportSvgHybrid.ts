import { getQrMatrix } from '@/lib/qr/createQr'

export async function exportSvgHybrid(
  rasterDataUrl: string,
  targetUrl: string,
  outputSize = 1024
): Promise<string> {
  const { matrix, size: qrSize } = await getQrMatrix(targetUrl, 'H')
  const moduleSize = outputSize / (qrSize + 8)
  const margin = moduleSize * 4

  const svgParts: string[] = []

  svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${outputSize}" height="${outputSize}" viewBox="0 0 ${outputSize} ${outputSize}">`)

  // Embed raster background
  svgParts.push(`<image href="${rasterDataUrl}" x="0" y="0" width="${outputSize}" height="${outputSize}" />`)

  // Vector QR overlay for critical modules (finder patterns + timing)
  svgParts.push(`<g opacity="0.85">`)

  // Draw finder patterns as crisp vector
  const finderPositions = [
    { row: 0, col: 0 },
    { row: 0, col: qrSize - 7 },
    { row: qrSize - 7, col: 0 },
  ]

  for (const pos of finderPositions) {
    const x = margin + pos.col * moduleSize
    const y = margin + pos.row * moduleSize
    const s = moduleSize

    // Outer border
    svgParts.push(`<rect x="${x}" y="${y}" width="${7 * s}" height="${7 * s}" fill="#000000" />`)
    svgParts.push(`<rect x="${x + s}" y="${y + s}" width="${5 * s}" height="${5 * s}" fill="#FFFFFF" />`)
    svgParts.push(`<rect x="${x + 2 * s}" y="${y + 2 * s}" width="${3 * s}" height="${3 * s}" fill="#000000" />`)
  }

  svgParts.push(`</g>`)
  svgParts.push(`</svg>`)

  return svgParts.join('\n')
}

export function downloadSvgHybrid(svgContent: string, filename: string) {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
