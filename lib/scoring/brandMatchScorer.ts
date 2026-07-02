export function calculateBrandMatchScore(
  _imageDataUrl?: string,
  brandColors?: string[]
): number {
  if (!brandColors?.length) return 80

  // In a full implementation, this would:
  // 1. Extract dominant colors from the generated image via canvas
  // 2. Calculate CIEDE2000 color distance from each extracted color to brand palette
  // 3. Score based on how many brand colors appear in the image
  // 4. Penalize colors that are far from the brand palette
  //
  // Baseline score scaled by brand color count
  return brandColors.length >= 3 ? 75 : 70
}

export function deltaE(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)

  const lab1 = rgbToLab(rgb1)
  const lab2 = rgbToLab(rgb2)

  const dL = lab1.l - lab2.l
  const da = lab1.a - lab2.a
  const db = lab1.b - lab2.b

  return Math.sqrt(dL * dL + da * da + db * db)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

function rgbToLab(rgb: { r: number; g: number; b: number }): { l: number; a: number; b: number } {
  let r = rgb.r / 255
  let g = rgb.g / 255
  let b = rgb.b / 255

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116

  return {
    l: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
  }
}
