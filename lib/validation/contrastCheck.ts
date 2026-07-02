function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

export function contrastRatio(color1: string, color2: string): number {
  const [r1, g1, b1] = hexToRgb(color1)
  const [r2, g2, b2] = hexToRgb(color2)
  const l1 = luminance(r1, g1, b1)
  const l2 = luminance(r2, g2, b2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function checkContrast(
  fgColor: string,
  bgColor: string
): 'pass' | 'warning' | 'fail' {
  const ratio = contrastRatio(fgColor, bgColor)
  if (ratio >= 4.5) return 'pass'
  if (ratio >= 3) return 'warning'
  return 'fail'
}

export function checkImageContrast(
  imageData: Uint8ClampedArray,
  width: number,
  height: number
): { status: 'pass' | 'warning' | 'fail'; ratio: number } {
  let darkPixels = 0
  let lightPixels = 0
  let darkLum = 0
  let lightLum = 0

  for (let i = 0; i < imageData.length; i += 4) {
    const lum = luminance(imageData[i], imageData[i + 1], imageData[i + 2])
    if (lum < 0.5) {
      darkPixels++
      darkLum += lum
    } else {
      lightPixels++
      lightLum += lum
    }
  }

  if (darkPixels === 0 || lightPixels === 0) {
    return { status: 'fail', ratio: 1 }
  }

  const avgDark = darkLum / darkPixels
  const avgLight = lightLum / lightPixels
  const ratio = (avgLight + 0.05) / (avgDark + 0.05)

  let status: 'pass' | 'warning' | 'fail' = 'fail'
  if (ratio >= 4.5) status = 'pass'
  else if (ratio >= 3) status = 'warning'

  return { status, ratio }
}
