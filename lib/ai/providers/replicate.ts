import {
  createPrediction,
  pollPrediction as pollPredictionCommon,
  getOutputUrl,
} from './replicate-common'

export interface ReplicateQrArtRequest {
  qrCodeContent: string
  prompt: string
  negativePrompt?: string
  guidanceScale?: number
  controlnetConditioningScale?: number
  strength?: number
  seed?: number
  numInferenceSteps?: number
  modelVersion?: string
}

export interface ReplicateQrArtResponse {
  imageUrl: string
  seed: number
}

const DEFAULT_NEGATIVE_PROMPT = 'ugly, disfigured, low quality, blurry, nsfw, text, watermark, signature, extra fingers, mutated hands, poorly drawn face, deformed, bad anatomy'
const DEFAULT_QR_MODEL_VERSION = 'dfc29dc0b65eb3e0b2ef95972ffc4b744bb7e5e60a98f42fae3fd0e80b3e8ad2'

export async function generateQrArt(
  apiToken: string,
  request: ReplicateQrArtRequest
): Promise<ReplicateQrArtResponse> {
  const seed = request.seed ?? Math.floor(Math.random() * 2147483647)

  const prediction = await createPrediction(
    apiToken,
    request.modelVersion || DEFAULT_QR_MODEL_VERSION,
    {
      qr_code_content: request.qrCodeContent,
      prompt: request.prompt,
      negative_prompt: request.negativePrompt ?? DEFAULT_NEGATIVE_PROMPT,
      guidance_scale: request.guidanceScale ?? 7.5,
      controlnet_conditioning_scale: request.controlnetConditioningScale ?? 1.5,
      strength: request.strength ?? 0.9,
      seed,
      num_inference_steps: request.numInferenceSteps ?? 30,
    }
  )

  const completed = await pollPredictionCommon(apiToken, prediction.id)
  return {
    imageUrl: getOutputUrl(completed),
    seed: (completed.input?.seed as number) ?? seed,
  }
}

export async function generateQrArtVariants(
  apiToken: string,
  request: ReplicateQrArtRequest,
  count = 4
): Promise<ReplicateQrArtResponse[]> {
  const promises = Array.from({ length: count }, (_, i) =>
    generateQrArt(apiToken, {
      ...request,
      seed: (request.seed ?? Math.floor(Math.random() * 2147483647)) + i * 1000,
      prompt: `${request.prompt}. Variation ${i + 1}.`,
    })
  )
  return Promise.all(promises)
}
