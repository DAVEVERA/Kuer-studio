import type { StylePresetId, AiModelId } from '@/types/qr'

export interface BatchItem {
  url: string
  stylePreset?: StylePresetId
  model?: AiModelId
  customPrompt?: string
}

export interface BatchResult {
  url: string
  variants: BatchVariantResult[]
  status: 'complete' | 'partial' | 'failed'
  error?: string
}

export interface BatchVariantResult {
  imageDataUrl: string
  prompt: string
  model?: AiModelId
  seed?: number
}

export interface BatchProgress {
  totalUrls: number
  completedUrls: number
  currentUrl: string
  status: 'processing' | 'complete'
}

export async function generateBatch(
  items: BatchItem[],
  sharedParams: {
    stylePreset: StylePresetId
    model?: AiModelId
    variantCount?: number
    outputSize?: number
  },
  onProgress: (progress: BatchProgress) => void
): Promise<BatchResult[]> {
  const results: BatchResult[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    onProgress({
      totalUrls: items.length,
      completedUrls: i,
      currentUrl: item.url,
      status: 'processing',
    })

    try {
      const response = await fetch('/api/ai/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: item.url,
          stylePreset: item.stylePreset ?? sharedParams.stylePreset,
          model: item.model ?? sharedParams.model,
          customPrompt: item.customPrompt,
          variantCount: sharedParams.variantCount ?? 2,
          outputSize: sharedParams.outputSize ?? 1024,
        }),
      })

      if (!response.ok) {
        results.push({ url: item.url, variants: [], status: 'failed', error: `HTTP ${response.status}` })
        continue
      }

      const variants: BatchVariantResult[] = []
      const reader = response.body?.getReader()
      if (!reader) {
        results.push({ url: item.url, variants: [], status: 'failed', error: 'No stream' })
        continue
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const match = line.match(/^data: (.+)$/m)
          if (!match) continue
          try {
            const event = JSON.parse(match[1])
            if (event.type === 'variant_complete') {
              variants.push({
                imageDataUrl: event.imageDataUrl,
                prompt: event.prompt,
                model: event.model,
                seed: event.seed,
              })
            }
          } catch { /* skip */ }
        }
      }

      results.push({
        url: item.url,
        variants,
        status: variants.length > 0 ? 'complete' : 'failed',
      })
    } catch (error) {
      results.push({
        url: item.url,
        variants: [],
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  onProgress({
    totalUrls: items.length,
    completedUrls: items.length,
    currentUrl: '',
    status: 'complete',
  })

  return results
}
