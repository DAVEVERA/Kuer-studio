import type { ModuleStyle, CornerStyle } from '@/types/qr'

export function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: ModuleStyle,
  color: string
) {
  ctx.fillStyle = color
  const gap = size * 0.1
  const s = size - gap

  switch (style) {
    case 'square':
      ctx.fillRect(x + gap / 2, y + gap / 2, s, s)
      break

    case 'rounded': {
      const radius = s * 0.3
      ctx.beginPath()
      ctx.roundRect(x + gap / 2, y + gap / 2, s, s, radius)
      ctx.fill()
      break
    }

    case 'dot': {
      const r = s / 2
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, r, 0, Math.PI * 2)
      ctx.fill()
      break
    }

    case 'soft-pixel': {
      const radius = s * 0.15
      ctx.beginPath()
      ctx.roundRect(x + gap / 2, y + gap / 2, s, s, radius)
      ctx.fill()
      break
    }
  }
}

export function drawFinderPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  moduleSize: number,
  cornerStyle: CornerStyle,
  fgColor: string,
  bgColor: string
) {
  const outerSize = moduleSize * 7
  const middleSize = moduleSize * 5
  const innerSize = moduleSize * 3

  const r = cornerStyle === 'square' ? 0 : cornerStyle === 'rounded' ? moduleSize : moduleSize * 1.5

  ctx.fillStyle = fgColor
  ctx.beginPath()
  ctx.roundRect(x, y, outerSize, outerSize, r)
  ctx.fill()

  ctx.fillStyle = bgColor
  ctx.beginPath()
  ctx.roundRect(x + moduleSize, y + moduleSize, middleSize, middleSize, r * 0.7)
  ctx.fill()

  ctx.fillStyle = fgColor
  ctx.beginPath()
  ctx.roundRect(x + moduleSize * 2, y + moduleSize * 2, innerSize, innerSize, r * 0.5)
  ctx.fill()
}

export function renderStyledQr(
  ctx: CanvasRenderingContext2D,
  matrix: boolean[][],
  moduleSize: number,
  margin: number,
  moduleStyle: ModuleStyle,
  cornerStyle: CornerStyle,
  fgColor: string,
  bgColor: string
) {
  const size = matrix.length
  const canvasSize = size * moduleSize + margin * 2

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, canvasSize, canvasSize)

  const finderPositions = [
    { row: 0, col: 0 },
    { row: 0, col: size - 7 },
    { row: size - 7, col: 0 },
  ]

  for (const fp of finderPositions) {
    drawFinderPattern(
      ctx,
      margin + fp.col * moduleSize,
      margin + fp.row * moduleSize,
      moduleSize,
      cornerStyle,
      fgColor,
      bgColor
    )
  }

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!matrix[row][col]) continue

      const inFinder = finderPositions.some(
        (fp) => row >= fp.row && row < fp.row + 7 && col >= fp.col && col < fp.col + 7
      )
      if (inFinder) continue

      drawModule(
        ctx,
        margin + col * moduleSize,
        margin + row * moduleSize,
        moduleSize,
        moduleStyle,
        fgColor
      )
    }
  }
}
