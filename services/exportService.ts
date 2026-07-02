import { exportCanvasAsPng, exportDataUrlAsPng } from '@/lib/export/exportPng'
import { exportQrAsSvg } from '@/lib/export/exportSvg'
import { exportQrAsPdf, exportQrAsPrintReadyPdf } from '@/lib/export/exportPdf'
import { exportSocialAsset } from '@/lib/export/exportSocialAsset'
import type { ExportFormat } from '@/types/export'

export interface ExportOptions {
  format: ExportFormat
  qrDataUrl: string
  targetUrl: string
  projectName: string
  ctaText?: string
  canvas?: HTMLCanvasElement
  fgColor?: string
  bgColor?: string
}

export async function exportQr(options: ExportOptions): Promise<void> {
  const baseName = options.projectName.replace(/\s+/g, '-').toLowerCase()

  switch (options.format) {
    case 'png-1024':
      if (options.canvas) {
        await exportCanvasAsPng(options.canvas, `${baseName}-1024.png`, 1024)
      } else {
        exportDataUrlAsPng(options.qrDataUrl, `${baseName}-1024.png`)
      }
      break

    case 'png-2048':
      if (options.canvas) {
        await exportCanvasAsPng(options.canvas, `${baseName}-2048.png`, 2048)
      } else {
        exportDataUrlAsPng(options.qrDataUrl, `${baseName}-2048.png`)
      }
      break

    case 'svg':
      await exportQrAsSvg(options.targetUrl, `${baseName}.svg`, {
        fgColor: options.fgColor,
        bgColor: options.bgColor,
      })
      break

    case 'pdf':
      await exportQrAsPdf(options.qrDataUrl, `${baseName}.pdf`)
      break

    case 'pdf-print':
      await exportQrAsPrintReadyPdf(options.qrDataUrl, `${baseName}-print.pdf`)
      break

    case 'social-square':
      await exportSocialAsset('square', {
        qrDataUrl: options.qrDataUrl,
        ctaText: options.ctaText,
        brandName: options.projectName,
      }, `${baseName}-square.png`)
      break

    case 'social-story':
      await exportSocialAsset('story', {
        qrDataUrl: options.qrDataUrl,
        ctaText: options.ctaText,
        brandName: options.projectName,
      }, `${baseName}-story.png`)
      break

    case 'social-landscape':
      await exportSocialAsset('landscape', {
        qrDataUrl: options.qrDataUrl,
        ctaText: options.ctaText,
        brandName: options.projectName,
      }, `${baseName}-landscape.png`)
      break

    case 'a4-poster':
      await exportQrAsPdf(options.qrDataUrl, `${baseName}-a4.pdf`, {
        width: 595,
        height: 842,
        title: `${options.projectName} - A4 Poster`,
      })
      break

    case 'transparent-png':
      exportDataUrlAsPng(options.qrDataUrl, `${baseName}-transparent.png`)
      break
  }
}
