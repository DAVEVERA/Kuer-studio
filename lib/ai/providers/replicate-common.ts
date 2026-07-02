export interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output: string | string[] | null
  error: string | null
  input?: Record<string, unknown>
}

export async function createPrediction(
  apiToken: string,
  version: string,
  input: Record<string, unknown>
): Promise<ReplicatePrediction> {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ version, input }),
  })

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.status}`)
  }

  return response.json()
}

export async function pollPrediction(
  apiToken: string,
  predictionId: string,
  maxAttempts = 60,
  intervalMs = 2000
): Promise<ReplicatePrediction> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs))

    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { 'Authorization': `Bearer ${apiToken}` },
    })

    if (!response.ok) continue

    const prediction: ReplicatePrediction = await response.json()

    if (prediction.status === 'succeeded') {
      return prediction
    }

    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      throw new Error(`Prediction ${prediction.status}: ${prediction.error ?? 'unknown error'}`)
    }
  }

  throw new Error('Prediction timed out')
}

export function getOutputUrl(prediction: ReplicatePrediction): string {
  const output = prediction.output
  if (Array.isArray(output)) return output[0]
  if (typeof output === 'string') return output
  throw new Error('Prediction has no output')
}

export async function fetchImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch generated image: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? 'image/png'
  const arrayBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  return `data:${contentType};base64,${base64}`
}
