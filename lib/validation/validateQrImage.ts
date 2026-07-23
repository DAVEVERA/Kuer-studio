import type { ValidationReport } from '@/types/qr'
import { calculateScanabilityScore, getRecommendations } from './scanabilityScore'
import { checkContrast } from './contrastCheck'

export async function validateQrImage(
  imageDataUrl: string,
  expectedUrl: string,
  fgColor = '#000000',
  bgColor = '#FFFFFF'
): Promise<ValidationReport> {
  const contrastStatus = checkContrast(fgColor, bgColor)

  let decodedUrl: string | null = null
  let urlMatches = false
  let finderStatus: 'pass' | 'warning' | 'fail' = 'pass'

  try {
    const canvas = await dataUrlToCanvas(imageDataUrl)
    const result = await decodeQrFromCanvas(canvas)
    decodedUrl = result.decodedUrl
    urlMatches = decodedUrl === expectedUrl
    finderStatus = result.decodedUrl ? 'pass' : 'fail'
  } catch {
    // Never mark an image as scannable unless a real decoder read the expected URL.
    urlMatches = false
    decodedUrl = null
    finderStatus = 'fail'
  }

  const checks: ValidationReport['checks'] = {
    contrast: contrastStatus,
    quietZone: decodedUrl ? 'pass' : 'warning',
    finderPatterns: finderStatus,
    resolution: decodedUrl ? 'pass' : 'warning',
  }

  const score = calculateScanabilityScore(checks, urlMatches)
  const recommendations = getRecommendations(checks)

  return {
    isScannable: score >= 80,
    decodedUrl,
    urlMatches,
    score,
    checks,
    recommendations,
  }
}

export async function validateQrImageOnCanvas(
  canvas: HTMLCanvasElement,
  expectedUrl: string
): Promise<ValidationReport> {
  try {
    const jsQR = (await import('jsqr')).default
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No canvas context')

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, canvas.width, canvas.height)

    const decodedUrl = code?.data ?? null
    const urlMatches = decodedUrl === expectedUrl

    const checks: ValidationReport['checks'] = {
      contrast: code ? 'pass' : 'warning',
      quietZone: code ? 'pass' : 'warning',
      finderPatterns: code ? 'pass' : 'fail',
      resolution: canvas.width >= 256 ? 'pass' : canvas.width >= 128 ? 'warning' : 'fail',
    }

    const score = calculateScanabilityScore(checks, urlMatches)
    const recommendations = getRecommendations(checks)

    return {
      isScannable: !!code && urlMatches,
      decodedUrl,
      urlMatches,
      score,
      checks,
      recommendations,
    }
  } catch {
    return {
      isScannable: false,
      decodedUrl: null,
      urlMatches: false,
      score: 0,
      checks: {
        contrast: 'fail',
        quietZone: 'fail',
        finderPatterns: 'fail',
        resolution: 'fail',
      },
      recommendations: ['Unable to validate QR code — decoder unavailable'],
    }
  }
}

export async function validateDataUrl(
  dataUrl: string,
  expectedUrl: string
): Promise<ValidationReport> {
  const canvas = await dataUrlToCanvas(dataUrl)
  return validateQrImageOnCanvas(canvas, expectedUrl)
}

export async function validateGeneratedQrDataUrl(
  dataUrl: string,
  expectedUrl: string
): Promise<ValidationReport> {
  const report = await validateDataUrl(dataUrl, expectedUrl)
  if (!report.decodedUrl || !report.urlMatches) {
    return {
      ...report,
      isScannable: false,
      recommendations: [
        ...report.recommendations,
        'Do not publish this AI variant until a decoder reads the exact destination URL.',
      ],
    }
  }
  return report
}

async function dataUrlToCanvas(dataUrl: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      resolve(canvas)
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

async function decodeQrFromCanvas(canvas: HTMLCanvasElement): Promise<{ decodedUrl: string | null }> {
  try {
    const jsQR = (await import('jsqr')).default
    const ctx = canvas.getContext('2d')
    if (!ctx) return { decodedUrl: null }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, canvas.width, canvas.height)
    return { decodedUrl: code?.data ?? null }
  } catch {
    return { decodedUrl: null }
  }
}
