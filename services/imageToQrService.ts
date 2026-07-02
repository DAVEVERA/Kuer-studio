import { getQrMatrix } from '@/lib/qr/createQr'
import { createProtectionMaskMatrix } from '@/lib/qr/qrProtectionMask'
import { drawFinderPattern } from '@/lib/qr/qrStyles'
import type { ModuleStyle, CornerStyle } from '@/types/qr'
import type { ImageAnalysis, SafeZone } from './imageAnalysisService'

export type ImageQrMode = 'qr-into-image' | 'image-as-style'

export interface ImageQrOptions {
  mode: ImageQrMode
  targetUrl: string
  imageDataUrl: string
  analysis: ImageAnalysis
  fgColor?: string
  bgColor?: string
  moduleStyle?: ModuleStyle
  cornerStyle?: CornerStyle
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'
  qrOpacity?: number
  qrSize?: number
  qrPosition?: { x: number; y: number }
  outputSize?: number
  artisticIntensity?: number
}

export interface ImageQrResult {
  canvas: HTMLCanvasElement
  dataUrl: string
  mode: ImageQrMode
}

export async function generateImageQr(options: ImageQrOptions): Promise<ImageQrResult> {
  if (options.mode === 'qr-into-image') {
    return generateQrIntoImage(options)
  }
  return generateImageAsStyle(options)
}

async function generateQrIntoImage(options: ImageQrOptions): Promise<ImageQrResult> {
  const {
    targetUrl,
    imageDataUrl,
    analysis,
    fgColor = analysis.suggestedQrFgColor,
    cornerStyle = 'rounded',
    errorCorrection = 'H',
    qrSize = 0.35,
    outputSize = 1024,
  } = options

  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')!

  const img = await loadImage(imageDataUrl)
  ctx.drawImage(img, 0, 0, outputSize, outputSize)

  const { matrix, size: moduleCount, version } = await getQrMatrix(targetUrl, errorCorrection)

  const qrPixelSize = Math.round(outputSize * qrSize)
  const moduleSize = qrPixelSize / moduleCount

  let qrX: number, qrY: number
  if (options.qrPosition) {
    qrX = options.qrPosition.x * outputSize - qrPixelSize / 2
    qrY = options.qrPosition.y * outputSize - qrPixelSize / 2
  } else {
    const bestZone = findBestQrPlacement(analysis.safeZones, qrSize)
    qrX = bestZone.x * outputSize + (bestZone.width * outputSize - qrPixelSize) / 2
    qrY = bestZone.y * outputSize + (bestZone.height * outputSize - qrPixelSize) / 2
  }

  const padding = moduleSize * 3
  const bgRadius = moduleSize * 4

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetY = 4
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.beginPath()
  ctx.roundRect(qrX - padding, qrY - padding, qrPixelSize + padding * 2, qrPixelSize + padding * 2, bgRadius)
  ctx.fill()
  ctx.restore()

  const finderPositions = [
    { row: 0, col: 0 },
    { row: 0, col: moduleCount - 7 },
    { row: moduleCount - 7, col: 0 },
  ]

  for (const fp of finderPositions) {
    drawFinderPattern(ctx, qrX + fp.col * moduleSize, qrY + fp.row * moduleSize, moduleSize, cornerStyle, fgColor, '#FFFFFF')
  }

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!matrix[row][col]) continue
      const inFinder = finderPositions.some(fp => row >= fp.row && row < fp.row + 7 && col >= fp.col && col < fp.col + 7)
      if (inFinder) continue

      const x = qrX + col * moduleSize
      const y = qrY + row * moduleSize
      const gap = moduleSize * 0.12
      const s = moduleSize - gap
      const r = s * 0.3

      ctx.fillStyle = fgColor
      ctx.beginPath()
      ctx.roundRect(x + gap / 2, y + gap / 2, s, s, r)
      ctx.fill()
    }
  }

  return { canvas, dataUrl: canvas.toDataURL('image/png'), mode: 'qr-into-image' }
}

async function generateImageAsStyle(options: ImageQrOptions): Promise<ImageQrResult> {
  const {
    targetUrl,
    imageDataUrl,
    analysis,
    fgColor,
    cornerStyle = 'rounded',
    errorCorrection = 'H',
    qrOpacity = 0.85,
    outputSize = 1024,
    artisticIntensity = 0.6,
  } = options

  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')!

  const img = await loadImage(imageDataUrl)

  // Create source image canvas for pixel sampling
  const srcCanvas = document.createElement('canvas')
  srcCanvas.width = outputSize
  srcCanvas.height = outputSize
  const srcCtx = srcCanvas.getContext('2d')!
  srcCtx.drawImage(img, 0, 0, outputSize, outputSize)
  const srcData = srcCtx.getImageData(0, 0, outputSize, outputSize)

  const { matrix, size: moduleCount, version } = await getQrMatrix(targetUrl, errorCorrection)
  const protectionMask = createProtectionMaskMatrix(version, moduleCount)
  const margin = Math.floor(outputSize * 0.04)
  const moduleSize = (outputSize - margin * 2) / moduleCount

  const avgLum = analysis.averageLuminance
  const darkFg = fgColor ?? (avgLum > 0.5 ? '#000000' : '#FFFFFF')
  const lightBg = avgLum > 0.5 ? '#FFFFFF' : '#000000'

  // Draw the background image with slight blur for depth
  ctx.drawImage(img, 0, 0, outputSize, outputSize)

  // Apply QR structure using artistic color sampling
  const finderPositions = [
    { row: 0, col: 0 },
    { row: 0, col: moduleCount - 7 },
    { row: moduleCount - 7, col: 0 },
  ]

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const x = margin + col * moduleSize
      const y = margin + row * moduleSize
      const isProtected = protectionMask[row]?.[col] ?? false
      const isDark = matrix[row][col]

      const inFinder = finderPositions.some(fp => row >= fp.row && row < fp.row + 7 && col >= fp.col && col < fp.col + 7)
      if (inFinder) continue

      // Sample color from source image at this position
      const sampleX = Math.min(Math.floor(x + moduleSize / 2), outputSize - 1)
      const sampleY = Math.min(Math.floor(y + moduleSize / 2), outputSize - 1)
      const pixIdx = (sampleY * outputSize + sampleX) * 4
      const srcR = srcData.data[pixIdx]
      const srcG = srcData.data[pixIdx + 1]
      const srcB = srcData.data[pixIdx + 2]
      const srcLum = (0.2126 * srcR + 0.7152 * srcG + 0.0722 * srcB) / 255

      if (isDark) {
        // Dark module: darken the sampled color significantly
        const darkenFactor = isProtected ? 0.15 : 0.2 + artisticIntensity * 0.15
        const r = Math.floor(srcR * darkenFactor)
        const g = Math.floor(srcG * darkenFactor)
        const b = Math.floor(srcB * darkenFactor)
        const opacity = isProtected ? 1.0 : qrOpacity

        ctx.globalAlpha = opacity
        const gap = moduleSize * 0.08
        const s = moduleSize - gap
        const radius = s * 0.25

        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.beginPath()
        ctx.roundRect(x + gap / 2, y + gap / 2, s, s, radius)
        ctx.fill()
      } else {
        // Light module: lighten the sampled color
        if (isProtected) {
          const lightenFactor = 0.85 + artisticIntensity * 0.15
          const r = Math.min(255, Math.floor(srcR + (255 - srcR) * lightenFactor))
          const g = Math.min(255, Math.floor(srcG + (255 - srcG) * lightenFactor))
          const b = Math.min(255, Math.floor(srcB + (255 - srcB) * lightenFactor))

          ctx.globalAlpha = 0.85
          ctx.fillStyle = `rgb(${r},${g},${b})`
          ctx.fillRect(x, y, moduleSize, moduleSize)
        }
      }
    }
  }

  // Draw finder patterns with strong contrast and artistic styling
  ctx.globalAlpha = 1.0
  for (const fp of finderPositions) {
    const fpX = margin + fp.col * moduleSize
    const fpY = margin + fp.row * moduleSize
    const fpSize = moduleSize * 7
    const pad = moduleSize * 1.5

    // Sample dominant color near finder for artistic tinting
    const centerX = Math.floor(fpX + fpSize / 2)
    const centerY = Math.floor(fpY + fpSize / 2)
    const cIdx = (Math.min(centerY, outputSize - 1) * outputSize + Math.min(centerX, outputSize - 1)) * 4
    const tintR = srcData.data[cIdx]
    const tintG = srcData.data[cIdx + 1]
    const tintB = srcData.data[cIdx + 2]

    // White background behind finder
    ctx.fillStyle = lightBg
    ctx.beginPath()
    ctx.roundRect(fpX - pad, fpY - pad, fpSize + pad * 2, fpSize + pad * 2, moduleSize * 2)
    ctx.fill()

    // Tinted finder pattern
    const finderColor = `rgb(${Math.floor(tintR * 0.2)},${Math.floor(tintG * 0.2)},${Math.floor(tintB * 0.2)})`
    drawFinderPattern(ctx, fpX, fpY, moduleSize, cornerStyle, finderColor, lightBg)
  }

  ctx.globalAlpha = 1.0

  return { canvas, dataUrl: canvas.toDataURL('image/png'), mode: 'image-as-style' }
}

function findBestQrPlacement(safeZones: SafeZone[], qrSize: number): SafeZone {
  const candidates = safeZones.filter(z => z.width >= qrSize && z.height >= qrSize)
  if (candidates.length > 0) return candidates[0]
  return { x: (1 - qrSize) / 2, y: (1 - qrSize) / 2, width: qrSize, height: qrSize, score: 50 }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
