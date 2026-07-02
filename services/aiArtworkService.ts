import { generateQrArtwork, generateVariants, type ArtworkResult } from '@/lib/ai/provider'
import { buildFullPrompt } from '@/lib/ai/promptTemplates'
import type { StylePresetId } from '@/types/qr'

export interface ArtworkGenerationOptions {
  baseQrImage: string
  stylePreset: StylePresetId
  customPrompt?: string
  brandColors?: string[]
  logo?: string
  protectionMask?: boolean[][]
  outputSize?: number
  variantCount?: number
}

export async function generateArtworkVariants(
  options: ArtworkGenerationOptions
): Promise<ArtworkResult[]> {
  const prompt = buildFullPrompt(
    options.stylePreset,
    options.customPrompt,
    options.brandColors
  )

  return generateVariants(
    {
      baseQrImage: options.baseQrImage,
      prompt,
      stylePreset: options.stylePreset,
      brandColors: options.brandColors,
      logo: options.logo,
      protectionMask: options.protectionMask,
      outputSize: options.outputSize ?? 1024,
    },
    options.variantCount ?? 4
  )
}

export async function generateSingleArtwork(
  options: Omit<ArtworkGenerationOptions, 'variantCount'>
): Promise<ArtworkResult> {
  const prompt = buildFullPrompt(
    options.stylePreset,
    options.customPrompt,
    options.brandColors
  )

  return generateQrArtwork({
    baseQrImage: options.baseQrImage,
    prompt,
    stylePreset: options.stylePreset,
    brandColors: options.brandColors,
    logo: options.logo,
    protectionMask: options.protectionMask,
    outputSize: options.outputSize ?? 1024,
  })
}
