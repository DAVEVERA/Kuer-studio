import { env } from '@/lib/env'
import { z } from 'zod'
import { buildPromptFromTemplate } from '@/lib/ai/promptBuilder'
import { buildFullPrompt } from '@/lib/ai/promptTemplates'
import { createQrDataUrl } from '@/lib/qr/createQr'
import { generateQrArtwork } from '@/lib/ai/provider'
import { getParameterMatrix } from '@/lib/ai/variantOrchestrator'
import type { AiModelId } from '@/types/qr'

export const runtime = 'nodejs'
export const maxDuration = 300

const stylePresetSchema = z.enum([
  'premium-luxury', 'organic-nature', 'tech-circuitboard', 'podcast-artwork',
  'minimal-editorial', 'cyberpunk-neon', 'soft-community', 'restaurant-menu',
  'event-poster', 'product-packaging', 'corporate-clean', 'dark-futuristic',
])

const requestSchema = z.object({
  targetUrl: z.string().min(1),
  stylePreset: stylePresetSchema.default('corporate-clean'),
  model: z.enum(['flux-dev', 'qr-monster-v2', 'sd-controlnet']).optional(),
  customPrompt: z.string().optional(),
  brandColors: z.array(z.string()).optional(),
  outputSize: z.number().int().min(512).max(1536).default(1024),
  variantCount: z.number().int().min(1).max(8).default(4),
  visionAnalysis: z.any().optional(),
  useAiPrompt: z.boolean().default(false),
})

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid batch generation request', issues: parsed.error.flatten() }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!env.aiProviderKey) {
    return new Response(
      JSON.stringify({ error: 'No AI generation provider configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const {
    targetUrl,
    stylePreset,
    model: requestedModel,
    customPrompt,
    brandColors,
    outputSize,
    variantCount,
    visionAnalysis,
    useAiPrompt,
  } = parsed.data

  const model = (requestedModel ?? undefined) as AiModelId | undefined

  let prompt: string
  if (useAiPrompt && (visionAnalysis || customPrompt)) {
    const built = buildPromptFromTemplate({ stylePreset, customPrompt, visionAnalysis, brandColors })
    prompt = built.prompt
  } else {
    prompt = buildFullPrompt(stylePreset, customPrompt, brandColors)
  }

  const baseQrImage = await createQrDataUrl(targetUrl, {
    width: outputSize,
    margin: 4,
    errorCorrectionLevel: 'H',
    color: { dark: '#111111', light: '#808080' },
  })

  const paramMatrix = getParameterMatrix(model, variantCount)
  const baseSeed = Math.floor(Math.random() * 2147483647)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      send({ type: 'batch_start', total: variantCount })

      const concurrencyLimit = 3
      let completed = 0

      const generateVariant = async (index: number) => {
        const params = paramMatrix[index]
        const seed = baseSeed + index * 1000

        send({ type: 'variant_start', index })

        try {
          const result = await generateQrArtwork({
            baseQrImage,
            targetUrl,
            prompt: `${prompt} Variant ${index + 1}.`,
            stylePreset,
            model,
            brandColors,
            outputSize,
            controlnetConditioningScale: params.conditioningScale ?? params.controlWeight,
            guidanceScale: params.guidanceScale,
            strength: params.strength,
            numInferenceSteps: 32,
            seed,
            allowMockFallback: false,
          })

          completed++
          send({
            type: 'variant_complete',
            index,
            imageDataUrl: result.imageDataUrl,
            prompt: result.prompt,
            stylePreset: result.stylePreset,
            model: result.model,
            provider: result.provider,
            seed: result.seed,
            isAiGenerated: result.isAiGenerated,
            completed,
            total: variantCount,
          })
        } catch (error) {
          completed++
          send({
            type: 'variant_error',
            index,
            error: error instanceof Error ? error.message : 'Generation failed',
            completed,
            total: variantCount,
          })
        }
      }

      const queue = Array.from({ length: variantCount }, (_, i) => i)
      const running: Promise<void>[] = []

      while (queue.length > 0 || running.length > 0) {
        while (running.length < concurrencyLimit && queue.length > 0) {
          const index = queue.shift()!
          const promise = generateVariant(index).then(() => {
            running.splice(running.indexOf(promise), 1)
          })
          running.push(promise)
        }
        if (running.length > 0) {
          await Promise.race(running)
        }
      }

      send({ type: 'batch_complete', total: variantCount, completed })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
