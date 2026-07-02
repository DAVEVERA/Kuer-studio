import { env, hasAiProvider } from '@/lib/env'
import { upscaleImage } from './providers/replicate-upscale'

export type TargetResolution = 2048 | 4096 | 8192

export interface UpscaleParams {
  imageDataUrl: string
  targetResolution: TargetResolution
  faceEnhance?: boolean
}

export interface UpscaleResult {
  imageDataUrl: string
  resolution: TargetResolution
  method: 'ai-upscale' | 'canvas-upscale'
}

export async function upscaleVariant(params: UpscaleParams): Promise<UpscaleResult> {
  if (hasAiProvider()) {
    try {
      const scale = params.targetResolution >= 4096 ? 4 : 2
      const result = await upscaleImage(env.aiProviderKey, {
        imageUrl: params.imageDataUrl,
        scale,
        faceEnhance: params.faceEnhance,
      })
      return {
        imageDataUrl: result.imageDataUrl,
        resolution: params.targetResolution,
        method: 'ai-upscale',
      }
    } catch (error) {
      console.error('AI upscale failed, falling back to canvas:', error)
    }
  }

  return canvasUpscale(params.imageDataUrl, params.targetResolution)
}

function canvasUpscale(imageDataUrl: string, targetResolution: TargetResolution): Promise<UpscaleResult> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = targetResolution
      canvas.height = targetResolution
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, targetResolution, targetResolution)

      resolve({
        imageDataUrl: canvas.toDataURL('image/png'),
        resolution: targetResolution,
        method: 'canvas-upscale',
      })
    }
    img.onerror = () => {
      resolve({ imageDataUrl, resolution: targetResolution, method: 'canvas-upscale' })
    }
    img.src = imageDataUrl
  })
}
