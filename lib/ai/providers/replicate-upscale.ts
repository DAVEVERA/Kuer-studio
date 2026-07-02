import {
  createPrediction,
  pollPrediction,
  getOutputUrl,
  fetchImageAsDataUrl,
} from './replicate-common'

const DEFAULT_ESRGAN_MODEL = '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b'

export interface UpscaleRequest {
  imageUrl: string
  scale?: 2 | 4
  faceEnhance?: boolean
  modelVersion?: string
}

export interface UpscaleResponse {
  imageUrl: string
  imageDataUrl: string
  scale: number
}

export async function upscaleImage(
  apiToken: string,
  request: UpscaleRequest
): Promise<UpscaleResponse> {
  const scale = request.scale ?? 4
  const version = request.modelVersion ?? DEFAULT_ESRGAN_MODEL

  const prediction = await createPrediction(apiToken, version, {
    image: request.imageUrl,
    scale,
    face_enhance: request.faceEnhance ?? false,
  })

  const completed = await pollPrediction(apiToken, prediction.id, 60, 2000)
  const outputUrl = getOutputUrl(completed)
  const imageDataUrl = await fetchImageAsDataUrl(outputUrl)

  return {
    imageUrl: outputUrl,
    imageDataUrl,
    scale,
  }
}
