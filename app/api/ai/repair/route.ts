import { NextResponse } from 'next/server'
import { z } from 'zod'
import { env } from '@/lib/env'
import { detectProvider, generateQrArtwork } from '@/lib/ai/provider'
import { consumeGenerationQuota } from '@/lib/billing/usage'
import { httpUrlSchema, imageDataUrlSchema, promptSchema } from '@/lib/security/requestValidation'
import { enforceUserRateLimit, userRateLimitResponse } from '@/lib/auth/userRateLimit'

export const runtime = 'nodejs'

const requestSchema = z.object({
  imageDataUrl: imageDataUrlSchema,
  repairType: z.string().trim().min(1).max(64),
  targetUrl: httpUrlSchema,
  stylePreset: z.string().trim().max(64).optional(),
  customPrompt: promptSchema.optional(),
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
      { error: 'Invalid repair request', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { targetUrl, stylePreset, customPrompt } = parsed.data
  const provider = detectProvider()

  if (provider === 'unavailable') {
    return NextResponse.json(
      { error: 'No AI provider configured for regeneration repair' },
      { status: 503 }
    )
  }

  try {
    await consumeGenerationQuota(1)
    const result = await generateQrArtwork({
      baseQrImage: '',
      targetUrl,
      prompt: customPrompt ?? 'High contrast QR code art with clear finder patterns and strong scanability.',
      stylePreset: (stylePreset ?? 'corporate-clean') as never,
      controlnetConditioningScale: 2.0,
      guidanceScale: 9,
      strength: 0.75,
      numInferenceSteps: 40,
    })

    return NextResponse.json({
      imageDataUrl: result.imageDataUrl,
      repairType: 'regenerate',
      applied: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Repair regeneration failed' },
      { status: error instanceof Error && error.message.includes('quota') ? 429 : 502 }
    )
  }
}
