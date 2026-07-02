import type { ArtworkGenerationParams, ArtworkResult } from './provider'
import { getStylePreset } from './stylePresets'

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generatePatternSvg(colors: string[], seed: number, size: number): string {
  const rand = seededRandom(seed)
  const c = colors.length > 0 ? colors : ['#1a1a2e', '#16213e', '#0f3460', '#e94560']

  const bgGradientAngle = Math.floor(rand() * 360)
  const patternElements: string[] = []

  for (let i = 0; i < 12; i++) {
    const cx = Math.floor(rand() * size)
    const cy = Math.floor(rand() * size)
    const r = 20 + Math.floor(rand() * 60)
    const color = c[Math.floor(rand() * c.length)]
    const opacity = 0.1 + rand() * 0.25
    patternElements.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}"/>`
    )
  }

  for (let i = 0; i < 8; i++) {
    const x1 = Math.floor(rand() * size)
    const y1 = Math.floor(rand() * size)
    const x2 = Math.floor(rand() * size)
    const y2 = Math.floor(rand() * size)
    const color = c[Math.floor(rand() * c.length)]
    const opacity = 0.05 + rand() * 0.15
    const width = 1 + Math.floor(rand() * 3)
    patternElements.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" opacity="${opacity}"/>`
    )
  }

  for (let i = 0; i < 6; i++) {
    const x = Math.floor(rand() * size)
    const y = Math.floor(rand() * size)
    const w = 10 + Math.floor(rand() * 40)
    const h = 10 + Math.floor(rand() * 40)
    const color = c[Math.floor(rand() * c.length)]
    const opacity = 0.08 + rand() * 0.15
    const rx = Math.floor(rand() * 8)
    patternElements.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${color}" opacity="${opacity}"/>`
    )
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="bg" gradientTransform="rotate(${bgGradientAngle})">
        <stop offset="0%" stop-color="${c[0]}"/>
        <stop offset="100%" stop-color="${c[1] || c[0]}"/>
      </linearGradient>
      <radialGradient id="glow">
        <stop offset="0%" stop-color="${c[2] || c[0]}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${c[0]}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#bg)"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.4}" fill="url(#glow)"/>
    ${patternElements.join('\n    ')}
  </svg>`
}

export async function generateMockArtwork(
  params: ArtworkGenerationParams
): Promise<ArtworkResult> {
  const preset = getStylePreset(params.stylePreset)
  const colors = params.brandColors?.length
    ? params.brandColors
    : preset?.previewColors ?? ['#1a1a2e', '#16213e', '#0f3460', '#e94560']

  const seed = hashString(params.prompt + params.stylePreset)
  const size = params.outputSize ?? 1024
  const svg = generatePatternSvg(colors, seed, size)
  const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`

  return {
    imageDataUrl: dataUrl,
    prompt: params.prompt,
    stylePreset: params.stylePreset,
    isAiGenerated: false,
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}
