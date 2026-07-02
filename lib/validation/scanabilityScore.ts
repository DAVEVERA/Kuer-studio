import type { ValidationReport } from '@/types/qr'

export function calculateScanabilityScore(checks: ValidationReport['checks'], urlMatches: boolean): number {
  let score = 0

  if (urlMatches) score += 40

  const checkWeights = {
    contrast: 20,
    quietZone: 15,
    finderPatterns: 20,
    resolution: 5,
  }

  for (const [key, weight] of Object.entries(checkWeights)) {
    const status = checks[key as keyof typeof checks]
    if (status === 'pass') score += weight
    else if (status === 'warning') score += weight * 0.6
  }

  return Math.round(Math.min(100, Math.max(0, score)))
}

export function getRecommendations(checks: ValidationReport['checks']): string[] {
  const recs: string[] = []

  if (checks.contrast === 'fail') recs.push('Increase contrast between QR modules and background')
  else if (checks.contrast === 'warning') recs.push('Consider improving contrast for better scan reliability')

  if (checks.quietZone === 'fail') recs.push('Add or increase the quiet zone around the QR code')
  else if (checks.quietZone === 'warning') recs.push('Quiet zone is borderline — consider adding more whitespace')

  if (checks.finderPatterns === 'fail') recs.push('Restore finder patterns — they are damaged or obscured')
  else if (checks.finderPatterns === 'warning') recs.push('Finder patterns are partially obscured — simplify artwork near corners')

  if (checks.resolution === 'fail') recs.push('Increase output resolution for reliable scanning')
  else if (checks.resolution === 'warning') recs.push('Resolution is adequate but higher would improve reliability')

  if (recs.length === 0) recs.push('QR code meets all scanability requirements')

  return recs
}
