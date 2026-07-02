import { createQrSvgString } from '@/lib/qr/createQr'

export async function exportQrAsSvg(
  url: string,
  filename: string,
  options?: { fgColor?: string; bgColor?: string; width?: number; margin?: number }
): Promise<void> {
  const svgString = await createQrSvgString(url, {
    width: options?.width ?? 1024,
    margin: options?.margin ?? 4,
    color: {
      dark: options?.fgColor ?? '#000000',
      light: options?.bgColor ?? '#FFFFFF',
    },
  })

  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename
  link.href = blobUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(blobUrl)
}

export async function getQrSvgString(
  url: string,
  options?: { fgColor?: string; bgColor?: string; width?: number; margin?: number }
): Promise<string> {
  return createQrSvgString(url, {
    width: options?.width ?? 1024,
    margin: options?.margin ?? 4,
    color: {
      dark: options?.fgColor ?? '#000000',
      light: options?.bgColor ?? '#FFFFFF',
    },
  })
}
