export type RepairType =
  | 'enhance-contrast'
  | 'restore-finder-patterns'
  | 'fix-quiet-zone'
  | 'reduce-overlay'
  | 'simplify-artwork'
  | 'rebuild-modules'
  | 'regenerate'
  | 'reposition'

export interface RepairRequest {
  imageDataUrl: string
  repairType: RepairType
  targetUrl: string
  qrMatrix?: boolean[][]
  outputSize?: number
}

export interface RepairResult {
  imageDataUrl: string
  repairType: RepairType
  applied: boolean
}

export function repairContrast(imageDataUrl: string): Promise<RepairResult> {
  return applyCanvasRepair(imageDataUrl, 'enhance-contrast', (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data

    for (let i = 0; i < pixels.length; i += 4) {
      const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
      const factor = 1.4
      const adjusted = Math.round(128 + (gray - 128) * factor)

      const ratio = adjusted / (gray || 1)
      pixels[i] = Math.min(255, Math.max(0, Math.round(pixels[i] * ratio)))
      pixels[i + 1] = Math.min(255, Math.max(0, Math.round(pixels[i + 1] * ratio)))
      pixels[i + 2] = Math.min(255, Math.max(0, Math.round(pixels[i + 2] * ratio)))
    }

    ctx.putImageData(imageData, 0, 0)
  })
}

export function repairQuietZone(imageDataUrl: string, margin = 40): Promise<RepairResult> {
  return applyCanvasRepair(imageDataUrl, 'fix-quiet-zone', (ctx, width, height) => {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, margin)
    ctx.fillRect(0, height - margin, width, margin)
    ctx.fillRect(0, 0, margin, height)
    ctx.fillRect(width - margin, 0, margin, height)
  })
}

export function repairFinderPatterns(
  imageDataUrl: string,
  qrSize: number,
  moduleSize: number,
  margin: number
): Promise<RepairResult> {
  return applyCanvasRepair(imageDataUrl, 'restore-finder-patterns', (ctx) => {
    const finderPositions = [
      { x: margin, y: margin },
      { x: margin + (qrSize - 7) * moduleSize, y: margin },
      { x: margin, y: margin + (qrSize - 7) * moduleSize },
    ]

    for (const pos of finderPositions) {
      drawFinderPattern(ctx, pos.x, pos.y, moduleSize)
    }
  })
}

function drawFinderPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  moduleSize: number
) {
  const s = moduleSize

  // Outer black border (7x7)
  ctx.fillStyle = '#000000'
  ctx.fillRect(x, y, 7 * s, 7 * s)

  // Inner white (5x5)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(x + s, y + s, 5 * s, 5 * s)

  // Inner black (3x3)
  ctx.fillStyle = '#000000'
  ctx.fillRect(x + 2 * s, y + 2 * s, 3 * s, 3 * s)
}

async function applyCanvasRepair(
  imageDataUrl: string,
  repairType: RepairType,
  transform: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
): Promise<RepairResult> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      transform(ctx, img.width, img.height)

      resolve({
        imageDataUrl: canvas.toDataURL('image/png'),
        repairType,
        applied: true,
      })
    }
    img.onerror = () => {
      resolve({ imageDataUrl, repairType, applied: false })
    }
    img.src = imageDataUrl
  })
}
