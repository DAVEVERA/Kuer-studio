import type { ValidationReport } from '@/types/qr'
import { calculateVisualScore } from './visualScorer'
import { calculateBrandMatchScore } from './brandMatchScorer'

export interface QrScorecard {
  scanScore: number
  visualScore: number
  brandMatchScore: number
  compositeScore: number
  breakdown: ScoreBreakdown
}

export interface ScoreBreakdown {
  scan: {
    decodable: number
    urlMatch: number
    contrast: number
    finderPatterns: number
    quietZone: number
    multiScanner: number
  }
  visual: {
    colorHarmony: number
    compositionBalance: number
    artifactFree: number
    styleAdherence: number
  }
  brand: {
    colorDistance: number
    paletteConsistency: number
  }
}

export function calculateScanScore(report: ValidationReport, multiScannerConfidence?: number): number {
  let score = 0

  if (report.isScannable) score += 25
  if (report.urlMatches) score += 15

  const checkScores: Record<string, number> = { pass: 15, warning: 8, fail: 0 }
  score += checkScores[report.checks.contrast] ?? 0
  score += checkScores[report.checks.finderPatterns] ?? 0
  score += checkScores[report.checks.quietZone] ?? 0
  score += checkScores[report.checks.resolution] ?? 0

  if (multiScannerConfidence !== undefined) {
    score += Math.round((multiScannerConfidence / 100) * 20)
  } else {
    score += report.isScannable ? 15 : 0
  }

  return Math.min(100, Math.max(0, score))
}

export function calculateScorecard(
  report: ValidationReport,
  imageDataUrl?: string,
  brandColors?: string[],
  multiScannerConfidence?: number
): QrScorecard {
  const scanScore = calculateScanScore(report, multiScannerConfidence)
  const visualScore = imageDataUrl ? calculateVisualScore(imageDataUrl) : 70
  const brandMatchScore = brandColors?.length ? calculateBrandMatchScore(imageDataUrl, brandColors) : 80

  const weights = { scan: 0.5, visual: 0.3, brand: 0.2 }
  const compositeScore = Math.round(
    scanScore * weights.scan +
    visualScore * weights.visual +
    brandMatchScore * weights.brand
  )

  return {
    scanScore,
    visualScore,
    brandMatchScore,
    compositeScore,
    breakdown: {
      scan: {
        decodable: report.isScannable ? 25 : 0,
        urlMatch: report.urlMatches ? 15 : 0,
        contrast: report.checks.contrast === 'pass' ? 15 : report.checks.contrast === 'warning' ? 8 : 0,
        finderPatterns: report.checks.finderPatterns === 'pass' ? 15 : report.checks.finderPatterns === 'warning' ? 8 : 0,
        quietZone: report.checks.quietZone === 'pass' ? 15 : report.checks.quietZone === 'warning' ? 8 : 0,
        multiScanner: multiScannerConfidence ? Math.round((multiScannerConfidence / 100) * 20) : 15,
      },
      visual: {
        colorHarmony: 0,
        compositionBalance: 0,
        artifactFree: 0,
        styleAdherence: 0,
      },
      brand: {
        colorDistance: 0,
        paletteConsistency: 0,
      },
    },
  }
}
