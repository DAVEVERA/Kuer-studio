import { NextResponse } from 'next/server'
import { z } from 'zod'
import { env, hasPromptProvider } from '@/lib/env'
import { buildPromptFromTemplate, buildLlmPromptPayload } from '@/lib/ai/promptBuilder'
import type { BuiltPrompt } from '@/lib/ai/promptBuilder'

export const runtime = 'nodejs'

const stylePresetSchema = z.enum([
  'premium-luxury', 'organic-nature', 'tech-circuitboard', 'podcast-artwork',
  'minimal-editorial', 'cyberpunk-neon', 'soft-community', 'restaurant-menu',
  'event-poster', 'product-packaging', 'corporate-clean', 'dark-futuristic',
])

const requestSchema = z.object({
  stylePreset: stylePresetSchema.optional(),
  customPrompt: z.string().optional(),
  visionAnalysis: z.any().optional(),
  brandColors: z.array(z.string()).optional(),
})

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid prompt build request', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (!hasPromptProvider()) {
    const result = buildPromptFromTemplate(parsed.data)
    return NextResponse.json(result)
  }

  try {
    const { systemPrompt, userPrompt } = buildLlmPromptPayload(parsed.data)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.aiPromptModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const result = buildPromptFromTemplate(parsed.data)
      return NextResponse.json(result)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      const result = buildPromptFromTemplate(parsed.data)
      return NextResponse.json(result)
    }

    const llmResult = JSON.parse(content) as BuiltPrompt
    return NextResponse.json({
      prompt: llmResult.prompt ?? '',
      negativePrompt: llmResult.negativePrompt ?? '',
    })
  } catch {
    const result = buildPromptFromTemplate(parsed.data)
    return NextResponse.json(result)
  }
}
