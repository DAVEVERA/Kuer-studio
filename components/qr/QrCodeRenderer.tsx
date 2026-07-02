'use client'

import { useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import type { ModuleStyle, CornerStyle } from '@/types/qr'

interface QrCodeRendererProps {
  url: string
  size?: number
  fgColor?: string
  bgColor?: string
  moduleStyle?: ModuleStyle
  cornerStyle?: CornerStyle
  quietZone?: number
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'
  logoUrl?: string
  logoSize?: number
  className?: string
}

export function QrCodeRenderer({
  url,
  size = 256,
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  moduleStyle = 'square',
  cornerStyle = 'square',
  quietZone = 4,
  errorCorrection = 'H',
  logoUrl,
  logoSize = 20,
  className,
}: QrCodeRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawRoundedRect = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
    ctx.fill()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !url) return

    const renderQr = async () => {
      try {
        const qrData = QRCode.create(url, {
          errorCorrectionLevel: errorCorrection,
        })
        const modules = qrData.modules
        const moduleCount = modules.size
        const moduleSize = (size - quietZone * 2) / moduleCount
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = size
        canvas.height = size

        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, size, size)
        ctx.fillStyle = fgColor

        const isFinderPattern = (row: number, col: number) => {
          return (
            (row < 7 && col < 7) ||
            (row < 7 && col >= moduleCount - 7) ||
            (row >= moduleCount - 7 && col < 7)
          )
        }

        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (!modules.get(row, col)) continue

            const x = quietZone + col * moduleSize
            const y = quietZone + row * moduleSize

            const isFinder = isFinderPattern(row, col)
            const style = isFinder ? cornerStyle : moduleStyle
            const r = moduleSize * 0.3

            switch (style) {
              case 'rounded':
                drawRoundedRect(ctx, x, y, moduleSize, moduleSize, r)
                break
              case 'extra-rounded':
                drawRoundedRect(ctx, x, y, moduleSize, moduleSize, moduleSize * 0.45)
                break
              case 'dot':
                ctx.beginPath()
                ctx.arc(x + moduleSize / 2, y + moduleSize / 2, moduleSize * 0.4, 0, Math.PI * 2)
                ctx.fill()
                break
              case 'soft-pixel': {
                const inset = moduleSize * 0.08
                drawRoundedRect(ctx, x + inset, y + inset, moduleSize - inset * 2, moduleSize - inset * 2, r * 0.5)
                break
              }
              default:
                ctx.fillRect(x, y, moduleSize, moduleSize)
            }
          }
        }

        if (logoUrl) {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            const logoW = size * (logoSize / 100)
            const logoH = logoW * (img.height / img.width)
            const logoX = (size - logoW) / 2
            const logoY = (size - logoH) / 2

            const pad = 4
            ctx.fillStyle = bgColor
            drawRoundedRect(ctx, logoX - pad, logoY - pad, logoW + pad * 2, logoH + pad * 2, 6)
            ctx.drawImage(img, logoX, logoY, logoW, logoH)
          }
          img.src = logoUrl
        }
      } catch {
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        canvas.width = size
        canvas.height = size
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, size, size)
        ctx.fillStyle = '#666'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Enter a valid URL', size / 2, size / 2)
      }
    }

    renderQr()
  }, [url, size, fgColor, bgColor, moduleStyle, cornerStyle, quietZone, errorCorrection, logoUrl, logoSize, drawRoundedRect])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
