import type { StylePresetId, AiModelId } from '@/types/qr'
import type { VisionAnalysisResult } from '@/types/vision'

export interface BatchGenerationParams {
  targetUrl: string
  stylePreset: StylePresetId
  model?: AiModelId
  customPrompt?: string
  brandColors?: string[]
  outputSize?: number
  visionAnalysis?: VisionAnalysisResult
  useAiPrompt?: boolean
  variantCount?: number
}

export interface VariantResult {
  index: number
  imageDataUrl: string
  prompt: string
  stylePreset: string
  model?: AiModelId
  provider: string
  seed?: number
  isAiGenerated: boolean
}

export interface BatchProgress {
  total: number
  completed: number
  currentIndex: number
  status: 'generating' | 'complete' | 'error'
  error?: string
}

export function getParameterMatrix(
  model: AiModelId | undefined,
  count: number
): Array<{
  controlWeight?: number
  guidanceScale?: number
  strength?: number
  conditioningScale?: number
}> {
  const matrix: Array<Record<string, number>> = []

  if (model === 'flux-dev') {
    const controlWeights = [0.7, 0.85, 1.0, 1.2, 0.75, 0.9, 1.1, 0.8]
    const guidanceScales = [3.5, 5, 7, 9, 4, 6, 8, 7.5]
    for (let i = 0; i < count; i++) {
      matrix.push({
        controlWeight: controlWeights[i % controlWeights.length],
        guidanceScale: guidanceScales[i % guidanceScales.length],
      })
    }
  } else if (model === 'qr-monster-v2') {
    const conditioningScales = [1.2, 1.5, 1.8, 2.1, 1.35, 1.65, 1.95, 1.5]
    const strengths = [0.75, 0.82, 0.88, 0.95, 0.78, 0.85, 0.92, 0.8]
    for (let i = 0; i < count; i++) {
      matrix.push({
        conditioningScale: conditioningScales[i % conditioningScales.length],
        strength: strengths[i % strengths.length],
      })
    }
  } else {
    const conditioningScales = [1.45, 1.7, 1.3, 1.6, 1.5, 1.8, 1.35, 1.55]
    const guidanceScales = [7.5, 8.5, 7, 9, 7.5, 8, 7.5, 8.5]
    const strengths = [0.88, 0.82, 0.9, 0.85, 0.87, 0.83, 0.89, 0.84]
    for (let i = 0; i < count; i++) {
      matrix.push({
        conditioningScale: conditioningScales[i % conditioningScales.length],
        guidanceScale: guidanceScales[i % guidanceScales.length],
        strength: strengths[i % strengths.length],
      })
    }
  }

  return matrix
}
