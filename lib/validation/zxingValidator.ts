export interface ZxingDecodeResult {
  text: string
  format: string
  isValid: boolean
}

export async function decodeWithZxing(imageData: ImageData): Promise<ZxingDecodeResult | null> {
  try {
    const { readBarcodes } = await import('zxing-wasm/reader')
    const results = await readBarcodes(imageData, {
      formats: ['QRCode'],
      tryHarder: true,
      maxNumberOfSymbols: 1,
    })

    if (results.length > 0 && results[0].text) {
      return {
        text: results[0].text,
        format: results[0].format ?? 'QRCode',
        isValid: true,
      }
    }
    return null
  } catch {
    return null
  }
}

export async function decodeWithMultipleProcessing(
  canvas: HTMLCanvasElement,
  expectedUrl?: string
): Promise<ZxingDecodeResult | null> {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const width = canvas.width
  const height = canvas.height

  const processors: Array<{ name: string; getData: () => ImageData }> = [
    {
      name: 'original',
      getData: () => ctx.getImageData(0, 0, width, height),
    },
    {
      name: 'high-contrast',
      getData: () => {
        const data = ctx.getImageData(0, 0, width, height)
        const pixels = data.data
        for (let i = 0; i < pixels.length; i += 4) {
          const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
          const val = gray > 128 ? 255 : 0
          pixels[i] = val
          pixels[i + 1] = val
          pixels[i + 2] = val
        }
        return data
      },
    },
    {
      name: 'inverted',
      getData: () => {
        const data = ctx.getImageData(0, 0, width, height)
        const pixels = data.data
        for (let i = 0; i < pixels.length; i += 4) {
          pixels[i] = 255 - pixels[i]
          pixels[i + 1] = 255 - pixels[i + 1]
          pixels[i + 2] = 255 - pixels[i + 2]
        }
        return data
      },
    },
    {
      name: 'grayscale',
      getData: () => {
        const data = ctx.getImageData(0, 0, width, height)
        const pixels = data.data
        for (let i = 0; i < pixels.length; i += 4) {
          const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
          pixels[i] = gray
          pixels[i + 1] = gray
          pixels[i + 2] = gray
        }
        return data
      },
    },
  ]

  for (const processor of processors) {
    const imageData = processor.getData()
    const result = await decodeWithZxing(imageData)
    if (result) {
      if (!expectedUrl || result.text === expectedUrl || result.text.includes(expectedUrl) || expectedUrl.includes(result.text)) {
        return result
      }
    }
  }

  return null
}
