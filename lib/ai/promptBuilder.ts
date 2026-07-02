import type { StylePresetId } from '@/types/qr'
import type { VisionAnalysisResult } from '@/types/vision'
import type { QrModeId } from '@/types/qrModes'
import { getPromptTemplate } from './promptTemplates'
import { buildModePrompt as buildFromMode } from './modePromptTemplates'
import { getQrMode } from './qrModes'

const QR_SAFETY_SUFFIX = 'Preserve QR code scanability. Keep finder patterns clearly visible. Maintain high contrast on QR data modules. Preserve timing patterns and quiet zone borders.'

export interface PromptBuilderParams {
  stylePreset?: StylePresetId
  customPrompt?: string
  visionAnalysis?: VisionAnalysisResult
  brandColors?: string[]
  useLlm?: boolean
  modeId?: QrModeId
  variationId?: string
}

export interface BuiltPrompt {
  prompt: string
  negativePrompt: string
}

export async function buildAiPrompt(params: PromptBuilderParams): Promise<BuiltPrompt> {
  if (params.useLlm) {
    return buildPromptWithLlm(params)
  }
  return buildPromptFromTemplate(params)
}

async function buildPromptWithLlm(params: PromptBuilderParams): Promise<BuiltPrompt> {
  const response = await fetch('/api/ai/build-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    return buildPromptFromTemplate(params)
  }

  return response.json()
}

export function buildPromptFromTemplate(params: PromptBuilderParams): BuiltPrompt {
  const parts: string[] = []

  if (params.customPrompt) {
    parts.push(params.customPrompt)
  } else if (params.stylePreset) {
    parts.push(getPromptTemplate(params.stylePreset))
  }

  if (params.visionAnalysis) {
    const va = params.visionAnalysis
    if (va.colors.length > 0) {
      const colorNames = va.colors.slice(0, 4).map(c => c.name).join(', ')
      parts.push(`Color palette: ${colorNames}.`)
    }
    if (va.style.length > 0) {
      parts.push(`Art style: ${va.style.join(', ')}.`)
    }
    if (va.suggestedKeywords.length > 0) {
      parts.push(`Keywords: ${va.suggestedKeywords.slice(0, 5).join(', ')}.`)
    }
    if (va.composition) {
      parts.push(`Composition: ${va.composition}`)
    }
  }

  if (params.brandColors?.length) {
    parts.push(`Incorporate brand colors: ${params.brandColors.join(', ')}.`)
  }

  parts.push(QR_SAFETY_SUFFIX)

  return {
    prompt: parts.join(' '),
    negativePrompt: 'ugly, disfigured, low quality, blurry, nsfw, text, watermark, signature, poorly drawn, deformed, bad anatomy, QR code destroyed, finder patterns missing, unreadable QR',
  }
}

export function injectScanabilitySafeguards(prompt: string): string {
  if (prompt.toLowerCase().includes('preserve qr')) return prompt
  return `${prompt} ${QR_SAFETY_SUFFIX}`
}

const LLM_SYSTEM_PROMPT = `You are an expert at writing Stable Diffusion / FLUX prompts for QR code art generation. Given image analysis data and a style preference, generate an optimized prompt that will create stunning artwork where the QR code pattern is naturally integrated into the composition.

Rules:
- The QR code must remain scannable — finder patterns and data modules must be preserved
- Focus on art styles where geometric patterns feel natural (architecture, circuits, mosaics, textiles)
- Include specific artistic details: lighting, materials, textures, composition
- Keep prompts under 200 words
- Always end with QR safety instructions

Return JSON with fields: "prompt" (string) and "negativePrompt" (string).`

export function buildLlmPromptPayload(params: PromptBuilderParams): {
  systemPrompt: string
  userPrompt: string
} {
  const contextParts: string[] = []

  if (params.stylePreset) {
    contextParts.push(`Style preset: ${params.stylePreset}`)
  }
  if (params.customPrompt) {
    contextParts.push(`User's custom direction: ${params.customPrompt}`)
  }
  if (params.visionAnalysis) {
    contextParts.push(`Image analysis: ${JSON.stringify(params.visionAnalysis)}`)
  }
  if (params.brandColors?.length) {
    contextParts.push(`Brand colors: ${params.brandColors.join(', ')}`)
  }

  return {
    systemPrompt: LLM_SYSTEM_PROMPT,
    userPrompt: `Generate an optimized diffusion prompt for artistic QR code generation.\n\n${contextParts.join('\n')}`,
  }
}

export function buildModeBasedPrompt(
  modeId: QrModeId,
  variationId?: string,
  visionAnalysis?: VisionAnalysisResult,
  brandColors?: string[],
  customPrompt?: string
): BuiltPrompt {
  const mode = getQrMode(modeId)
  const variation = variationId
    ? mode.styleVariations.find(v => v.id === variationId)
    : undefined

  return buildFromMode(
    modeId,
    variation?.prompt,
    visionAnalysis,
    brandColors,
    customPrompt
  )
}
