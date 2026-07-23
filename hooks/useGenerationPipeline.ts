'use client'

import { useState, useCallback, useRef } from 'react'
import type { StylePresetId, AiModelId, ValidationReport } from '@/types/qr'
import type { VisionAnalysisResult } from '@/types/vision'
import { validateGeneratedQrDataUrl } from '@/lib/validation/validateQrImage'

export interface GeneratedVariant {
  index: number
  imageDataUrl: string
  prompt: string
  stylePreset: string
  model?: AiModelId
  provider: string
  seed?: number
  isAiGenerated: boolean
  score: number
  report: ValidationReport
}

export interface GenerationProgress {
  total: number
  completed: number
  currentIndex: number
  status: 'idle' | 'generating' | 'complete' | 'error'
  error?: string
}

export interface GenerationRequest {
  targetUrl: string
  stylePreset: StylePresetId
  model?: AiModelId
  customPrompt?: string
  brandColors?: string[]
  outputSize?: number
  variantCount?: number
  visionAnalysis?: VisionAnalysisResult
  useAiPrompt?: boolean
}

export function useGenerationPipeline() {
  const [variants, setVariants] = useState<GeneratedVariant[]>([])
  const [progress, setProgress] = useState<GenerationProgress>({
    total: 0,
    completed: 0,
    currentIndex: -1,
    status: 'idle',
  })
  const abortRef = useRef<AbortController | null>(null)

  const generate = useCallback(async (request: GenerationRequest) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setVariants([])
    setProgress({
      total: request.variantCount ?? 4,
      completed: 0,
      currentIndex: 0,
      status: 'generating',
    })

    try {
      const response = await fetch('/api/ai/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Generation failed' }))
        setProgress(prev => ({ ...prev, status: 'error', error: error.error }))
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        setProgress(prev => ({ ...prev, status: 'error', error: 'No response stream' }))
        return
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
          const dataMatch = line.match(/^data: (.+)$/m)
          if (!dataMatch) continue

          try {
            const event = JSON.parse(dataMatch[1])

            switch (event.type) {
              case 'variant_start':
                setProgress(prev => ({ ...prev, currentIndex: event.index }))
                break

              case 'variant_complete': {
                const report = await validateGeneratedQrDataUrl(event.imageDataUrl, request.targetUrl)
                setVariants(prev => [
                  ...prev,
                  {
                    index: event.index,
                    imageDataUrl: event.imageDataUrl,
                    prompt: event.prompt,
                    stylePreset: event.stylePreset,
                    model: event.model,
                    provider: event.provider,
                    seed: event.seed,
                    isAiGenerated: event.isAiGenerated,
                    score: report.score,
                    report,
                  },
                ])
                setProgress(prev => ({
                  ...prev,
                  completed: event.completed,
                  total: event.total,
                }))
                break
              }

              case 'variant_error':
                setProgress(prev => ({
                  ...prev,
                  completed: event.completed,
                  total: event.total,
                }))
                break

              case 'batch_complete':
                setProgress(prev => ({
                  ...prev,
                  completed: event.completed,
                  total: event.total,
                  status: 'complete',
                }))
                break
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Generation failed',
      }))
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setProgress(prev => ({ ...prev, status: 'idle' }))
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setVariants([])
    setProgress({ total: 0, completed: 0, currentIndex: -1, status: 'idle' })
  }, [])

  return {
    variants,
    progress,
    isGenerating: progress.status === 'generating',
    generate,
    cancel,
    reset,
  }
}
