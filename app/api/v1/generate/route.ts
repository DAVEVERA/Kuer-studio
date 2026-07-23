import { NextResponse } from 'next/server'
import { z } from 'zod'
import { env } from '@/lib/env'
import { ApiRateLimitError, enforceApiKeyRateLimit, validateApiKey } from '@/lib/auth/apiKeyAuth'
import { buildPromptFromTemplate } from '@/lib/ai/promptBuilder'
import { buildFullPrompt } from '@/lib/ai/promptTemplates'
import { createQrDataUrl } from '@/lib/qr/createQr'
import { generateQrArtwork } from '@/lib/ai/provider'
import type { AiModelId, StylePresetId } from '@/types/qr'
import { consumeGenerationQuota } from '@/lib/billing/usage'
import { brandColorsSchema, httpUrlSchema, promptSchema } from '@/lib/security/requestValidation'

export const runtime = 'nodejs'
export const maxDuration = 120

const requestSchema = z.object({
  url: httpUrlSchema,
  style: z.string().default('corporate-clean'),
  model: z.enum(['flux-dev', 'qr-monster-v2', 'sd-controlnet']).optional(),
  prompt: promptSchema.optional(),
  brand_colors: brandColorsSchema.optional(),
  size: z.number().int().min(512).max(1536).default(1024),
  variants: z.number().int().min(1).max(8).default(1),
})

export async function POST(request: Request) {
  const apiKey = await validateApiKey(request.headers.get('authorization'))
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Invalid or missing API key. Use Authorization: Bearer <your-key>' },
      { status: 401 }
    )
  }

  if (!apiKey.scopes.includes('generate')) {
    return NextResponse.json(
      { error: 'API key does not have "generate" scope' },
      { status: 403 }
    )
  }

  try {
    await enforceApiKeyRateLimit(apiKey)
  } catch (error) {
    if (error instanceof ApiRateLimitError) {
      return NextResponse.json({ error: error.message }, {
        status: 429,
        headers: { 'Retry-After': String(error.retryAfter) },
      })
    }
    return NextResponse.json({ error: 'API rate limit unavailable.' }, { status: 503 })
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (!env.aiProviderKey) {
    return NextResponse.json({ error: 'AI provider not configured' }, { status: 503 })
  }

  const { url: targetUrl, style, model: requestedModel, prompt: customPrompt, brand_colors, size, variants } = parsed.data
  const stylePreset = style as StylePresetId
  const model = (requestedModel ?? undefined) as AiModelId | undefined

  try {
    await consumeGenerationQuota(variants, apiKey.userId)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation quota unavailable.' },
      { status: error instanceof Error && error.message.includes('quota') ? 429 : 503 }
    )
  }

  const fullPrompt = customPrompt
    ? buildPromptFromTemplate({ stylePreset, customPrompt, brandColors: brand_colors }).prompt
    : buildFullPrompt(stylePreset, undefined, brand_colors)

  const baseQrImage = await createQrDataUrl(targetUrl, {
    width: size,
    margin: 4,
    errorCorrectionLevel: 'H',
    color: { dark: '#111111', light: '#808080' },
  })

  const results = []
  const baseSeed = Math.floor(Math.random() * 2147483647)

  for (let i = 0; i < variants; i++) {
    try {
      const result = await generateQrArtwork({
        baseQrImage,
        targetUrl,
        prompt: `${fullPrompt} Variant ${i + 1}.`,
        stylePreset,
        model,
        brandColors: brand_colors,
        outputSize: size,
        seed: baseSeed + i * 1000,
      })

      results.push({
        variant: i + 1,
        image_data_url: result.imageDataUrl,
        model: result.model,
        provider: result.provider,
        seed: result.seed,
        is_ai_generated: result.isAiGenerated,
      })
    } catch (error) {
      results.push({
        variant: i + 1,
        error: error instanceof Error ? error.message : 'Generation failed',
      })
    }
  }

  return NextResponse.json({
    url: targetUrl,
    style: stylePreset,
    model: model ?? 'auto',
    variants: results,
    generated_at: new Date().toISOString(),
  })
}
