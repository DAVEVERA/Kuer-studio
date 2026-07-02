export function checkQuietZone(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  expectedMarginPx: number
): 'pass' | 'warning' | 'fail' {
  let cleanPixels = 0
  let totalBorderPixels = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inMargin =
        x < expectedMarginPx ||
        x >= width - expectedMarginPx ||
        y < expectedMarginPx ||
        y >= height - expectedMarginPx

      if (!inMargin) continue

      totalBorderPixels++
      const idx = (y * width + x) * 4
      const r = imageData[idx]
      const g = imageData[idx + 1]
      const b = imageData[idx + 2]

      if (r > 200 && g > 200 && b > 200) {
        cleanPixels++
      }
    }
  }

  if (totalBorderPixels === 0) return 'fail'

  const ratio = cleanPixels / totalBorderPixels
  if (ratio >= 0.9) return 'pass'
  if (ratio >= 0.7) return 'warning'
  return 'fail'
}

export function estimateQuietZone(
  imageData: Uint8ClampedArray,
  width: number,
  height: number
): number {
  let margin = 0
  for (let x = 0; x < width / 4; x++) {
    const idx = (0 * width + x) * 4
    const r = imageData[idx]
    const g = imageData[idx + 1]
    const b = imageData[idx + 2]
    if (r > 200 && g > 200 && b > 200) {
      margin++
    } else {
      break
    }
  }
  return margin
}
