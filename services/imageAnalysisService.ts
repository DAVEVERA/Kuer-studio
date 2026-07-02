export interface ImageAnalysis {
  dominantColors: string[]
  averageLuminance: number
  contrastLevel: 'high' | 'medium' | 'low'
  suggestedQrFgColor: string
  suggestedQrBgColor: string
  safeZones: SafeZone[]
  dimensions: { width: number; height: number }
  aspectRatio: number
  hasTransparency: boolean
}

export interface SafeZone {
  x: number
  y: number
  width: number
  height: number
  score: number
}

export async function analyzeImage(imageDataUrl: string): Promise<ImageAnalysis> {
  const img = await loadImage(imageDataUrl)
  const canvas = document.createElement('canvas')
  const size = 256
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, size, size)
  const imageData = ctx.getImageData(0, 0, size, size)

  const dominantColors = extractDominantColors(imageData.data, size, size)
  const averageLuminance = calculateAverageLuminance(imageData.data)
  const contrastLevel = averageLuminance > 0.6 ? 'high' : averageLuminance > 0.3 ? 'medium' : 'low'
  const hasTransparency = detectTransparency(imageData.data)

  const suggestedQrFgColor = averageLuminance > 0.5 ? '#000000' : '#FFFFFF'
  const suggestedQrBgColor = averageLuminance > 0.5 ? '#FFFFFF' : '#000000'

  const safeZones = findSafeZones(imageData.data, size, size)

  return {
    dominantColors,
    averageLuminance,
    contrastLevel,
    suggestedQrFgColor,
    suggestedQrBgColor,
    safeZones,
    dimensions: { width: img.naturalWidth, height: img.naturalHeight },
    aspectRatio: img.naturalWidth / img.naturalHeight,
    hasTransparency,
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function extractDominantColors(data: Uint8ClampedArray, width: number, height: number): string[] {
  const buckets = new Map<string, number>()
  const step = 4

  for (let i = 0; i < data.length; i += 4 * step) {
    if (data[i + 3] < 128) continue
    const r = Math.round(data[i] / 32) * 32
    const g = Math.round(data[i + 1] / 32) * 32
    const b = Math.round(data[i + 2] / 32) * 32
    const key = `${r},${g},${b}`
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }

  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number)
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    })
}

function calculateAverageLuminance(data: Uint8ClampedArray): number {
  let total = 0
  let count = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    const r = data[i] / 255
    const g = data[i + 1] / 255
    const b = data[i + 2] / 255
    total += 0.2126 * r + 0.7152 * g + 0.0722 * b
    count++
  }
  return count > 0 ? total / count : 0.5
}

function detectTransparency(data: Uint8ClampedArray): boolean {
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) return true
  }
  return false
}

function findSafeZones(data: Uint8ClampedArray, width: number, height: number): SafeZone[] {
  const gridSize = 4
  const cellW = Math.floor(width / gridSize)
  const cellH = Math.floor(height / gridSize)
  const zones: SafeZone[] = []

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      let variance = 0
      let pixelCount = 0
      let lumSum = 0
      const lums: number[] = []

      for (let y = gy * cellH; y < (gy + 1) * cellH; y++) {
        for (let x = gx * cellW; x < (gx + 1) * cellW; x++) {
          const idx = (y * width + x) * 4
          const lum = 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2]
          lums.push(lum)
          lumSum += lum
          pixelCount++
        }
      }

      const avgLum = lumSum / pixelCount
      for (const l of lums) {
        variance += (l - avgLum) ** 2
      }
      variance = Math.sqrt(variance / pixelCount)

      // Lower variance = more uniform = better safe zone
      const score = Math.max(0, Math.min(100, Math.round(100 - variance * 1.5)))

      zones.push({
        x: gx / gridSize,
        y: gy / gridSize,
        width: 1 / gridSize,
        height: 1 / gridSize,
        score,
      })
    }
  }

  return zones.sort((a, b) => b.score - a.score)
}
