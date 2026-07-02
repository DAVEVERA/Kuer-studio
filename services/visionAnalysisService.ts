import type { VisionAnalysisResult } from '@/types/vision'

export async function analyzeImageWithAI(
  imageDataUrl: string,
  depth: 'basic' | 'detailed' = 'detailed'
): Promise<VisionAnalysisResult | null> {
  try {
    const response = await fetch('/api/ai/vision-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl, analysisDepth: depth }),
    })

    if (!response.ok) {
      if (response.status === 503) return null
      throw new Error(`Vision analysis failed: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Vision analysis service error:', error)
    return null
  }
}
