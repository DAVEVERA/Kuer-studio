import { NextResponse } from 'next/server'
import { z } from 'zod'
import { env, hasAiProvider } from '@/lib/env'
import { upscaleImage } from '@/lib/ai/providers/replicate-upscale'
import { consumeGenerationQuota } from '@/lib/billing/usage'
import { imageDataUrlSchema } from '@/lib/security/requestValidation'
import { enforceUserRateLimit, userRateLimitResponse } from '@/lib/auth/userRateLimit'

export const runtime = 'nodejs'
export const maxDuration = 120

const requestSchema = z.object({
  imageUrl: imageDataUrlSchema,
  scale: z.enum(['2', '4']).default('4'),
  faceEnhance: z.boolean().default(false),
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
      { error: 'Invalid upscale request', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (!hasAiProvider()) {
    return NextResponse.json(
      { error: 'No AI provider configured for upscaling' },
      { status: 503 }
    )
  }

  try {
    await consumeGenerationQuota(1)
    const result = await upscaleImage(env.aiProviderKey, {
      imageUrl: parsed.data.imageUrl,
      scale: Number(parsed.data.scale) as 2 | 4,
      faceEnhance: parsed.data.faceEnhance,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upscale failed' },
      { status: error instanceof Error && error.message.includes('quota') ? 429 : 502 }
    )
  }
}
