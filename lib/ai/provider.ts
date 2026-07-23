import { hasAiProvider, env, getFluxModelId, getQrMonsterModelId } from '@/lib/env'
import { generateQrArt, type ReplicateQrArtRequest } from './providers/replicate'
import { generateFluxQrArt, generateQrMonsterArt } from './providers/replicate-flux'
import { fetchImageAsDataUrl } from './providers/replicate-common'
import type { StylePresetId, AiModelId } from '@/types/qr'

export interface ArtworkGenerationParams {
  baseQrImage: string
  prompt: string
  stylePreset: StylePresetId
  model?: AiModelId
  brandColors?: string[]
  logo?: string
  protectionMask?: boolean[][]
  outputSize?: number
  targetUrl?: string
  controlnetConditioningScale?: number
  guidanceScale?: number
  strength?: number
  numInferenceSteps?: number
  seed?: number
}

export interface ArtworkResult {
  imageDataUrl: string
  prompt: string
  stylePreset: string
  isAiGenerated: boolean
  provider?: AiProvider
  model?: AiModelId
  seed?: number
}

export type AiProvider = 'replicate-flux' | 'replicate-qr-monster' | 'replicate-sd' | 'unavailable'

export function detectProvider(model?: AiModelId): AiProvider {
  if (!hasAiProvider()) return 'unavailable'

  if (model === 'flux-dev' && getFluxModelId()) return 'replicate-flux'
  if (model === 'qr-monster-v2' && getQrMonsterModelId()) return 'replicate-qr-monster'
  if (model === 'sd-controlnet' && env.aiProviderKey) return 'replicate-sd'

  if (getFluxModelId()) return 'replicate-flux'
  if (getQrMonsterModelId()) return 'replicate-qr-monster'
  if (env.aiProviderKey && env.aiProviderUrl?.includes('replicate')) return 'replicate-sd'

  return 'unavailable'
}

export function getAvailableModels(): AiModelId[] {
  const models: AiModelId[] = ['local']
  if (getFluxModelId()) models.unshift('flux-dev')
  if (getQrMonsterModelId()) models.unshift('qr-monster-v2')
  if (env.aiProviderKey) models.unshift('sd-controlnet')
  return models
}

export async function generateQrArtwork(
  params: ArtworkGenerationParams
): Promise<ArtworkResult> {
  const provider = detectProvider(params.model)

  if (provider === 'replicate-flux' && params.targetUrl) {
    return generateWithFlux(params)
  }

  if (provider === 'replicate-qr-monster' && params.targetUrl) {
    return generateWithQrMonster(params)
  }

  if (provider === 'replicate-sd' && env.aiProviderKey && params.targetUrl) {
    return generateWithReplicateSd(params)
  }

  throw new Error('No configured AI generation provider is available')
}

async function generateWithFlux(params: ArtworkGenerationParams): Promise<ArtworkResult> {
  try {
    const result = await generateFluxQrArt(env.aiProviderKey, getFluxModelId(), {
      prompt: params.prompt,
      controlImage: params.baseQrImage,
      controlWeight: params.controlnetConditioningScale ?? 0.85,
      guidanceScale: params.guidanceScale ?? 7.5,
      numInferenceSteps: params.numInferenceSteps ?? 30,
      width: params.outputSize ?? 1024,
      height: params.outputSize ?? 1024,
      seed: params.seed,
    })

    return {
      imageDataUrl: result.imageDataUrl,
      prompt: params.prompt,
      stylePreset: params.stylePreset,
      isAiGenerated: true,
      provider: 'replicate-flux',
      model: 'flux-dev',
      seed: result.seed,
    }
  } catch (error) {
    throw error
  }
}

async function generateWithQrMonster(params: ArtworkGenerationParams): Promise<ArtworkResult> {
  try {
    const result = await generateQrMonsterArt(env.aiProviderKey, getQrMonsterModelId(), {
      prompt: params.prompt,
      qrCodeContent: params.targetUrl!,
      controlImage: params.baseQrImage,
      conditioningScale: params.controlnetConditioningScale ?? 1.5,
      guidanceScale: params.guidanceScale ?? 7.5,
      strength: params.strength ?? 0.85,
      numInferenceSteps: params.numInferenceSteps ?? 30,
      seed: params.seed,
    })

    return {
      imageDataUrl: result.imageDataUrl,
      prompt: params.prompt,
      stylePreset: params.stylePreset,
      isAiGenerated: true,
      provider: 'replicate-qr-monster',
      model: 'qr-monster-v2',
      seed: result.seed,
    }
  } catch (error) {
    throw error
  }
}

async function generateWithReplicateSd(params: ArtworkGenerationParams): Promise<ArtworkResult> {
  try {
    const result = await generateQrArt(env.aiProviderKey, {
      qrCodeContent: params.targetUrl!,
      prompt: params.prompt,
      controlnetConditioningScale: params.controlnetConditioningScale ?? 1.5,
      guidanceScale: params.guidanceScale ?? 7.5,
      strength: params.strength ?? 0.9,
      seed: params.seed,
      numInferenceSteps: params.numInferenceSteps ?? 30,
      modelVersion: env.replicateQrModelVersion,
    })

    const imageDataUrl = await fetchImageAsDataUrl(result.imageUrl)

    return {
      imageDataUrl,
      prompt: params.prompt,
      stylePreset: params.stylePreset,
      isAiGenerated: true,
      provider: 'replicate-sd',
      model: 'sd-controlnet',
      seed: result.seed,
    }
  } catch (error) {
    throw error
  }
}

export async function generateVariants(
  params: ArtworkGenerationParams,
  count = 4
): Promise<ArtworkResult[]> {
  const baseSeed = params.seed ?? Math.floor(Math.random() * 2147483647)
  const promises = Array.from({ length: count }, (_, i) =>
    generateQrArtwork({
      ...params,
      seed: baseSeed + i * 1000,
    })
  )
  return Promise.all(promises)
}
