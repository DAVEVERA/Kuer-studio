import type { QrModeId } from '@/types/qrModes'
import type { VisionAnalysisResult } from '@/types/vision'

const QR_SAFETY: Record<string, string> = {
  strict: 'CRITICAL: Preserve all QR finder patterns with maximum contrast. Keep timing patterns and data modules clearly readable. Maintain quiet zone borders. Scanability is the top priority.',
  moderate: 'Preserve QR code scanability. Keep finder patterns clearly visible. Maintain high contrast on QR data modules. Preserve timing patterns and quiet zone borders.',
  relaxed: 'Integrate QR patterns artistically. Finder patterns should remain identifiable. Data modules should maintain sufficient contrast for scanning.',
}

const MODE_TEMPLATES: Record<QrModeId, {
  base: string
  negative: string
  safetyLevel: 'strict' | 'moderate' | 'relaxed'
}> = {
  brand: {
    base: 'Professional branded QR code artwork. Corporate design language, clean composition, logo-ready areas, brand-consistent color palette. High-end marketing asset quality.',
    negative: 'ugly, amateur, clip-art, low resolution, text watermarks, distorted logo, off-brand colors',
    safetyLevel: 'strict',
  },
  character: {
    base: 'Character portrait with QR code matrix integrated as skin texture, clothing pattern, or facial geometry. Detailed character design, expressive features, dynamic lighting.',
    negative: 'ugly, deformed, extra limbs, blurry face, bad anatomy, low quality',
    safetyLevel: 'moderate',
  },
  product: {
    base: 'Product photography with seamlessly embedded QR code. Studio lighting, clean background, professional product presentation. Print-ready packaging quality.',
    negative: 'ugly, blurry, distorted product, amateur photography, low resolution',
    safetyLevel: 'strict',
  },
  architecture: {
    base: 'Architectural composition where QR code modules form building facades, structural elements, and urban geometry. Dramatic perspective, professional architectural visualization.',
    negative: 'ugly, blurry, distorted buildings, unrealistic architecture, low quality',
    safetyLevel: 'moderate',
  },
  cyberpunk: {
    base: 'Cyberpunk aesthetic with QR code as integrated design element. Neon lighting, holographic effects, dark urban atmosphere, high-tech visual language. QR finder patterns as design features.',
    negative: 'ugly, blurry, low contrast, washed out colors, amateur',
    safetyLevel: 'relaxed',
  },
  abstract: {
    base: 'Abstract art composition with QR code as structural foundation. Geometric patterns, color field exploration, artistic texture. Gallery-quality digital art.',
    negative: 'ugly, muddy colors, boring, flat, low resolution, amateur',
    safetyLevel: 'moderate',
  },
  isometric: {
    base: 'Isometric 3D illustration where QR code modules become building blocks for a miniature world. Tilt-shift perspective, vibrant colors, detailed micro-scene.',
    negative: 'ugly, flat, 2D, low detail, blurry, distorted perspective',
    safetyLevel: 'moderate',
  },
  storytelling: {
    base: 'Narrative illustration with QR code woven into the scene composition. Rich storytelling environment, detailed characters and props, cinematic mood lighting.',
    negative: 'ugly, empty scene, low detail, amateur illustration, flat lighting',
    safetyLevel: 'moderate',
  },
}

export function buildModePrompt(
  modeId: QrModeId,
  variationPrompt?: string,
  visionAnalysis?: VisionAnalysisResult,
  brandColors?: string[],
  customPrompt?: string
): { prompt: string; negativePrompt: string } {
  const template = MODE_TEMPLATES[modeId]
  const parts: string[] = []

  if (customPrompt) {
    parts.push(customPrompt)
  } else if (variationPrompt) {
    parts.push(variationPrompt)
  } else {
    parts.push(template.base)
  }

  if (visionAnalysis) {
    if (visionAnalysis.colors.length > 0) {
      parts.push(`Color palette: ${visionAnalysis.colors.slice(0, 4).map(c => c.name).join(', ')}.`)
    }
    if (visionAnalysis.style.length > 0) {
      parts.push(`Style reference: ${visionAnalysis.style.join(', ')}.`)
    }
    if (visionAnalysis.suggestedKeywords.length > 0) {
      parts.push(`Elements: ${visionAnalysis.suggestedKeywords.slice(0, 5).join(', ')}.`)
    }
  }

  if (brandColors?.length) {
    parts.push(`Brand colors: ${brandColors.join(', ')}.`)
  }

  parts.push(QR_SAFETY[template.safetyLevel])

  return {
    prompt: parts.join(' '),
    negativePrompt: `${template.negative}, QR code destroyed, finder patterns missing, unreadable QR, broken scan pattern`,
  }
}
