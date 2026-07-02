import type { VisionAnalysisResult } from '@/types/vision'

const ANALYSIS_SYSTEM_PROMPT = `You are a professional image analysis AI for a QR code art platform. Analyze the uploaded image and return structured JSON with the following fields:

- colors: array of {hex, name, prominence} for dominant colors (max 6), prominence 0-1
- objects: array of {name, confidence, position} for detected objects, confidence 0-1, position is "center", "top-left", "bottom-right" etc.
- composition: one-sentence description of the overall composition and layout
- style: array of style descriptors (e.g. "minimalist", "cyberpunk", "photorealistic", "illustrated")
- brandElements: array of detected brand elements (logos, text, symbols, brand names)
- hasFaces: boolean indicating if human faces are present
- suggestedKeywords: array of 5-10 keywords useful for generating AI art inspired by this image
- rawDescription: 2-3 sentence natural language description of the image

Return ONLY valid JSON, no markdown formatting.`

export async function analyzeImageWithVision(
  apiKey: string,
  imageBase64: string,
  model = 'gpt-4o'
): Promise<VisionAnalysisResult> {
  const imageContent = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:image/png;base64,${imageBase64}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this image for use in AI QR code art generation.' },
            { type: 'image_url', image_url: { url: imageContent, detail: 'high' } },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI Vision API error ${response.status}: ${error}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No content in OpenAI Vision response')
  }

  const parsed = JSON.parse(content)
  return normalizeVisionResult(parsed)
}

function normalizeVisionResult(raw: Record<string, unknown>): VisionAnalysisResult {
  return {
    colors: Array.isArray(raw.colors)
      ? raw.colors.map((c: Record<string, unknown>) => ({
          hex: String(c.hex ?? '#000000'),
          name: String(c.name ?? 'unknown'),
          prominence: Number(c.prominence ?? 0),
        }))
      : [],
    objects: Array.isArray(raw.objects)
      ? raw.objects.map((o: Record<string, unknown>) => ({
          name: String(o.name ?? 'unknown'),
          confidence: Number(o.confidence ?? 0),
          position: String(o.position ?? 'center'),
        }))
      : [],
    composition: String(raw.composition ?? ''),
    style: Array.isArray(raw.style) ? raw.style.map(String) : [],
    brandElements: Array.isArray(raw.brandElements) ? raw.brandElements.map(String) : [],
    hasFaces: Boolean(raw.hasFaces),
    suggestedKeywords: Array.isArray(raw.suggestedKeywords) ? raw.suggestedKeywords.map(String) : [],
    rawDescription: String(raw.rawDescription ?? ''),
  }
}
