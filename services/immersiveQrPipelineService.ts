import type { StylePresetId, AiModelId } from '@/types/qr'
import type { VisionAnalysisResult } from '@/types/vision'

export interface ImmersiveQrPipelineRequest {
  targetUrl: string
  stylePreset: StylePresetId
  model?: AiModelId
  customPrompt?: string
  brandColors?: string[]
  outputSize?: number
  variantIndex?: number
  controlnetConditioningScale?: number
  guidanceScale?: number
  strength?: number
  numInferenceSteps?: number
  uploadedImage?: string
  visionAnalysis?: VisionAnalysisResult
  useAiPrompt?: boolean
}

export interface ImmersiveQrPipelineResult {
  imageDataUrl: string
  prompt: string
  stylePreset: string
  isAiGenerated: boolean
  provider: string
  model?: AiModelId
  seed?: number
}

export async function generateImmersiveQrVariant(
  request: ImmersiveQrPipelineRequest
): Promise<ImmersiveQrPipelineResult> {
  const response = await fetch('/api/ai/immersive-qr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error ?? `Immersive QR pipeline failed: ${response.status}`)
  }

  return response.json()
}
