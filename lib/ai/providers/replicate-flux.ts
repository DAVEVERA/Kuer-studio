import {
  createPrediction,
  pollPrediction,
  getOutputUrl,
  fetchImageAsDataUrl,
} from './replicate-common'

export interface FluxQrRequest {
  prompt: string
  negativePrompt?: string
  controlImage: string
  controlWeight?: number
  guidanceScale?: number
  numInferenceSteps?: number
  width?: number
  height?: number
  seed?: number
  outputFormat?: 'png' | 'webp'
}

export interface FluxQrResponse {
  imageUrl: string
  imageDataUrl: string
  seed: number
}

const DEFAULT_NEGATIVE_PROMPT = 'ugly, disfigured, low quality, blurry, nsfw, text, watermark, poorly drawn, deformed, noisy, overexposed'

export async function generateFluxQrArt(
  apiToken: string,
  modelVersion: string,
  request: FluxQrRequest
): Promise<FluxQrResponse> {
  const seed = request.seed ?? Math.floor(Math.random() * 2147483647)

  const prediction = await createPrediction(apiToken, modelVersion, {
    prompt: request.prompt,
    negative_prompt: request.negativePrompt ?? DEFAULT_NEGATIVE_PROMPT,
    control_image: request.controlImage,
    control_weight: request.controlWeight ?? 0.85,
    guidance_scale: request.guidanceScale ?? 7.5,
    num_inference_steps: request.numInferenceSteps ?? 30,
    width: request.width ?? 1024,
    height: request.height ?? 1024,
    seed,
    output_format: request.outputFormat ?? 'png',
  })

  const completed = await pollPrediction(apiToken, prediction.id, 90, 2000)
  const imageUrl = getOutputUrl(completed)
  const imageDataUrl = await fetchImageAsDataUrl(imageUrl)

  return { imageUrl, imageDataUrl, seed }
}

export interface QrMonsterRequest {
  prompt: string
  negativePrompt?: string
  qrCodeContent: string
  controlImage?: string
  conditioningScale?: number
  guidanceScale?: number
  strength?: number
  numInferenceSteps?: number
  seed?: number
}

export interface QrMonsterResponse {
  imageUrl: string
  imageDataUrl: string
  seed: number
}

export async function generateQrMonsterArt(
  apiToken: string,
  modelVersion: string,
  request: QrMonsterRequest
): Promise<QrMonsterResponse> {
  const seed = request.seed ?? Math.floor(Math.random() * 2147483647)

  const input: Record<string, unknown> = {
    prompt: request.prompt,
    negative_prompt: request.negativePrompt ?? DEFAULT_NEGATIVE_PROMPT,
    qr_code_content: request.qrCodeContent,
    controlnet_conditioning_scale: request.conditioningScale ?? 1.5,
    guidance_scale: request.guidanceScale ?? 7.5,
    strength: request.strength ?? 0.85,
    num_inference_steps: request.numInferenceSteps ?? 30,
    seed,
  }

  if (request.controlImage) {
    input.control_image = request.controlImage
  }

  const prediction = await createPrediction(apiToken, modelVersion, input)
  const completed = await pollPrediction(apiToken, prediction.id, 90, 2000)
  const imageUrl = getOutputUrl(completed)
  const imageDataUrl = await fetchImageAsDataUrl(imageUrl)

  return { imageUrl, imageDataUrl, seed }
}

export async function generateFluxVariants(
  apiToken: string,
  modelVersion: string,
  request: FluxQrRequest,
  count = 4
): Promise<FluxQrResponse[]> {
  const baseSeed = request.seed ?? Math.floor(Math.random() * 2147483647)
  const controlWeights = [0.7, 0.85, 1.0, 1.2, 0.75, 0.9, 1.1, 0.8]
  const guidanceScales = [3.5, 5, 7, 9, 4, 6, 8, 7.5]

  const promises = Array.from({ length: count }, (_, i) =>
    generateFluxQrArt(apiToken, modelVersion, {
      ...request,
      seed: baseSeed + i * 1000,
      controlWeight: controlWeights[i % controlWeights.length],
      guidanceScale: guidanceScales[i % guidanceScales.length],
    })
  )
  return Promise.all(promises)
}

export async function generateQrMonsterVariants(
  apiToken: string,
  modelVersion: string,
  request: QrMonsterRequest,
  count = 4
): Promise<QrMonsterResponse[]> {
  const baseSeed = request.seed ?? Math.floor(Math.random() * 2147483647)
  const conditioningScales = [1.2, 1.5, 1.8, 2.1, 1.35, 1.65, 1.95, 1.5]
  const strengths = [0.75, 0.82, 0.88, 0.95, 0.78, 0.85, 0.92, 0.8]

  const promises = Array.from({ length: count }, (_, i) =>
    generateQrMonsterArt(apiToken, modelVersion, {
      ...request,
      seed: baseSeed + i * 1000,
      conditioningScale: conditioningScales[i % conditioningScales.length],
      strength: strengths[i % strengths.length],
    })
  )
  return Promise.all(promises)
}
