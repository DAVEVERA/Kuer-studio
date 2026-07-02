import { NextResponse } from 'next/server'
import { z } from 'zod'
import { env } from '@/lib/env'
import { detectProvider, generateQrArtwork } from '@/lib/ai/provider'

export const runtime = 'nodejs'

const requestSchema = z.object({
  imageDataUrl: z.string().min(1),
  repairType: z.string(),
  targetUrl: z.string().min(1),
  stylePreset: z.string().optional(),
  customPrompt: z.string().optional(),
})

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid repair request', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { targetUrl, stylePreset, customPrompt } = parsed.data
  const provider = detectProvider()

  if (provider === 'mock') {
    return NextResponse.json(
      { error: 'No AI provider configured for regeneration repair' },
      { status: 503 }
    )
  }

  try {
    const result = await generateQrArtwork({
      baseQrImage: '',
      targetUrl,
      prompt: customPrompt ?? 'High contrast QR code art with clear finder patterns and strong scanability.',
      stylePreset: (stylePreset ?? 'corporate-clean') as never,
      controlnetConditioningScale: 2.0,
      guidanceScale: 9,
      strength: 0.75,
      numInferenceSteps: 40,
      allowMockFallback: false,
    })

    return NextResponse.json({
      imageDataUrl: result.imageDataUrl,
      repairType: 'regenerate',
      applied: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Repair regeneration failed' },
      { status: 502 }
    )
  }
}
