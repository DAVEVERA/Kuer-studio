import { NextResponse } from 'next/server'
import { z } from 'zod'
import { env, hasVisionProvider } from '@/lib/env'
import { analyzeImageWithVision } from '@/lib/ai/providers/openai-vision'
import { consumeGenerationQuota } from '@/lib/billing/usage'
import { imageDataUrlSchema } from '@/lib/security/requestValidation'
import { enforceUserRateLimit, userRateLimitResponse } from '@/lib/auth/userRateLimit'

export const runtime = 'nodejs'

const requestSchema = z.object({
  image: imageDataUrlSchema,
  analysisDepth: z.enum(['basic', 'detailed']).default('detailed'),
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
      { error: 'Invalid vision analysis request', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (!hasVisionProvider()) {
    return NextResponse.json(
      { error: 'Vision analysis provider is not configured. Set OPENAI_API_KEY.' },
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

  try {
    const result = await analyzeImageWithVision(
      env.openaiApiKey,
      parsed.data.image,
      env.openaiVisionModel
    )

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Vision analysis failed' },
      { status: 502 }
    )
  }
}
