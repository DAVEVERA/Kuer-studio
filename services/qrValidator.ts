import { validateQrImage } from '@/lib/validation/validateQrImage'
import type { ValidationReport, ValidationStatus } from '@/types/qr'

export async function validateVariant(
  imageDataUrl: string,
  expectedUrl: string,
  fgColor = '#000000',
  bgColor = '#FFFFFF'
): Promise<{ report: ValidationReport; status: ValidationStatus }> {
  const report = await validateQrImage(imageDataUrl, expectedUrl, fgColor, bgColor)
  const status = deriveStatus(report)
  return { report, status }
}

function deriveStatus(report: ValidationReport): ValidationStatus {
  if (!report.isScannable) return 'not-scannable'
  if (report.checks.contrast === 'fail') return 'needs-contrast-improvement'
  if (report.checks.quietZone === 'fail') return 'quiet-zone-too-small'
  if (report.checks.finderPatterns === 'fail') return 'finder-pattern-damaged'
  if (report.score < 80) return 'low-scan-confidence'
  return 'validated'
}

export function getRepairSuggestions(report: ValidationReport): string[] {
  const suggestions: string[] = []
  if (report.checks.contrast === 'fail' || report.checks.contrast === 'warning') {
    suggestions.push('Increase Contrast')
  }
  if (report.checks.finderPatterns === 'fail' || report.checks.finderPatterns === 'warning') {
    suggestions.push('Restore Finder Patterns')
  }
  if (report.checks.quietZone === 'fail' || report.checks.quietZone === 'warning') {
    suggestions.push('Add Quiet Zone')
  }
  if (report.score < 70) {
    suggestions.push('Simplify Artwork')
    suggestions.push('Reduce AI Overlay')
    suggestions.push('Generate Safer Variant')
  }
  return suggestions
}
