export interface SocialAssetOptions {
  qrDataUrl: string
  bgColor?: string
  ctaText?: string
  brandName?: string
}

type SocialFormat = 'square' | 'story' | 'landscape'

const DIMENSIONS: Record<SocialFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
}

export async function exportSocialAsset(
  format: SocialFormat,
  options: SocialAssetOptions,
  filename: string
): Promise<void> {
  const { width, height } = DIMENSIONS[format]
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = options.bgColor ?? '#0B1117'
  ctx.fillRect(0, 0, width, height)

  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
    img.src = options.qrDataUrl
  })

  const qrSize = Math.min(width, height) * 0.6
  const qrX = (width - qrSize) / 2
  const qrY = (height - qrSize) / 2 - (options.ctaText ? 30 : 0)
  ctx.drawImage(img, qrX, qrY, qrSize, qrSize)

  if (options.ctaText) {
    ctx.fillStyle = '#F5F1ED'
    ctx.font = `bold ${Math.floor(width * 0.04)}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(options.ctaText, width / 2, qrY + qrSize + 60)
  }

  if (options.brandName) {
    ctx.fillStyle = '#A7B0B8'
    ctx.font = `${Math.floor(width * 0.02)}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(options.brandName, width / 2, height - 40)
  }

  const dataUrl = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
