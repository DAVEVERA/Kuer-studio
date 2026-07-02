'use client'

import { cn } from '@/lib/utils'
import { QrCodeRenderer } from './QrCodeRenderer'
import type { QrEditorState, FrameStyle } from '@/types/qr'

interface QrPreviewCanvasProps {
  editorState: QrEditorState
  size?: number
  className?: string
}

function FrameWrapper({ frameStyle, ctaText, children }: { frameStyle: FrameStyle; ctaText: string; children: React.ReactNode }) {
  if (frameStyle === 'none') return <>{children}</>

  const frameClasses: Record<FrameStyle, string> = {
    none: '',
    simple: 'border-2 border-white/20 p-4',
    rounded: 'border-2 border-white/20 p-4 rounded-2xl',
    badge: 'border-2 border-white/20 p-4 rounded-xl bg-white/5',
    banner: 'border-2 border-white/20 p-4 rounded-lg',
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', frameClasses[frameStyle])}>
      {children}
      {ctaText && (
        <span className="text-sm font-semibold tracking-wide text-foreground uppercase">
          {ctaText}
        </span>
      )}
    </div>
  )
}

export function QrPreviewCanvas({ editorState, size = 280, className }: QrPreviewCanvasProps) {
  return (
    <div className={cn('flex items-center justify-center p-8 bg-background/50 rounded-xl border border-border', className)}>
      <FrameWrapper frameStyle={editorState.frameStyle} ctaText={editorState.ctaText}>
        <QrCodeRenderer
          url={editorState.targetUrl || 'https://kuer.studio'}
          size={size}
          fgColor={editorState.fgColor}
          bgColor={editorState.bgColor}
          moduleStyle={editorState.moduleStyle}
          cornerStyle={editorState.cornerStyle}
          quietZone={editorState.quietZone * 4}
          errorCorrection={editorState.errorCorrection}
          logoUrl={editorState.logoUrl}
          logoSize={editorState.logoSize}
          className="rounded-md"
        />
      </FrameWrapper>
    </div>
  )
}
