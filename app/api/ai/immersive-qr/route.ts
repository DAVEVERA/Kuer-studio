import { NextResponse } from 'next/server'
import { z } from 'zod'
import { env, hasVisionProvider } from '@/lib/env'
import { buildPromptFromTemplate } from '@/lib/ai/promptBuilder'
import { buildFullPrompt } from '@/lib/ai/promptTemplates'
import { createQrDataUrl } from '@/lib/qr/createQr'
import { detectProvider, generateQrArtwork } from '@/lib/ai/provider'
import type { AiModelId } from '@/types/qr'
import { consumeGenerationQuota } from '@/lib/billing/usage'
import { brandColorsSchema, httpUrlSchema, promptSchema, visionAnalysisSchema } from '@/lib/security/requestValidation'
import { enforceUserRateLimit, userRateLimitResponse } from '@/lib/auth/userRateLimit'

export const runtime = 'nodejs'

const stylePresetSchema = z.enum([
  'premium-luxury', 'organic-nature', 'tech-circuitboard', 'podcast-artwork',
  'minimal-editorial', 'cyberpunk-neon', 'soft-community', 'restaurant-menu',
  'event-poster', 'product-packaging', 'corporate-clean', 'dark-futuristic',
])

const modelSchema = z.enum(['flux-dev', 'qr-monster-v2', 'sd-controlnet']).optional()

const requestSchema = z.object({
  targetUrl: httpUrlSchema,
  stylePreset: stylePresetSchema.default('corporate-clean'),
  model: modelSchema,
  customPrompt: promptSchema.optional(),
  brandColors: brandColorsSchema.optional(),
  outputSize: z.number().int().min(512).max(1536).default(1024),
  variantIndex: z.number().int().min(0).max(15).default(0),
  controlnetConditioningScale: z.number().min(0.5).max(3).optional(),
  guidanceScale: z.number().min(1).max(20).optional(),
  strength: z.number().min(0.1).max(1).optional(),
  numInferenceSteps: z.number().int().min(10).max(80).optional(),
  visionAnalysis: visionAnalysisSchema.optional(),
  useAiPrompt: z.boolean().default(false),
})

export async function POST(request: Request) {
  try {
    await enforceUserRateLimit('ai-browser', 10)
  } catch (error) {
    return userRateLimitResponse(error)
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid immersive QR pipeline request', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const {
    targetUrl,
    stylePreset,
    model: requestedModel,
    customPrompt,
    brandColors,
    outputSize,
    variantIndex,
    controlnetConditioningScale,
    guidanceScale,
    strength,
    numInferenceSteps,
    visionAnalysis,
    useAiPrompt,
  } = parsed.data

  const model = (requestedModel ?? undefined) as AiModelId | undefined
  const provider = detectProvider(model)

  if (provider === 'unavailable') {
    return NextResponse.json(
      { error: 'No AI generation provider is configured' },
      { status: 503 }
    )
  }

  try {
    await consumeGenerationQuota(1)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation quota unavailable.' },
      { status: error instanceof Error && error.message.includes('quota') ? 429 : 503 }
    )
  }

  let prompt: string
  let negativePrompt: string | undefined

  if (useAiPrompt && (visionAnalysis || customPrompt)) {
    const built = buildPromptFromTemplate({
      stylePreset,
      customPrompt,
      visionAnalysis,
      brandColors,
    })
    prompt = built.prompt
    negativePrompt = built.negativePrompt
  } else {
    prompt = [
      buildFullPrompt(stylePreset, customPrompt, brandColors),
      'Immersive environmental art, readable QR geometry, crisp finder patterns, no text overlays.',
      `Variant ${variantIndex + 1}.`,
    ].join(' ')
  }

  const baseQrImage = await createQrDataUrl(targetUrl, {
    width: outputSize,
    margin: 4,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#111111',
      light: '#808080',
    },
  })

  const seed = Math.floor(Math.random() * 2147483647) + variantIndex * 1000

  try {
    const result = await generateQrArtwork({
      baseQrImage,
      targetUrl,
      prompt,
      stylePreset,
      model,
      brandColors,
      outputSize,
      controlnetConditioningScale: controlnetConditioningScale ?? (variantIndex % 2 === 0 ? 1.45 : 1.7),
      guidanceScale: guidanceScale ?? (variantIndex < 2 ? 7.5 : 8.5),
      strength: strength ?? (variantIndex % 2 === 0 ? 0.88 : 0.82),
      numInferenceSteps: numInferenceSteps ?? 32,
      seed,
    })

    return NextResponse.json({
      ...result,
      provider: result.provider,
      model: result.model,
      seed: result.seed ?? seed,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'AI QR generation failed',
      },
      { status: 502 }
    )
  }
}
