'use client'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { FRAME_STYLES } from '@/lib/constants'
import type { FrameStyle } from '@/types/qr'

interface FrameStyleSelectorProps {
  value: FrameStyle
  onChange: (style: FrameStyle) => void
}

function FramePreview({ style }: { style: FrameStyle }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36">
      {style === 'none' && (
        <rect x="10" y="10" width="16" height="16" rx="1" fill="currentColor" opacity="0.4" />
      )}
      {style === 'simple' && (
        <>
          <rect x="4" y="4" width="28" height="28" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
          <rect x="10" y="10" width="16" height="16" rx="1" fill="currentColor" opacity="0.4" />
        </>
      )}
      {style === 'rounded' && (
        <>
          <rect x="4" y="4" width="28" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
          <rect x="10" y="10" width="16" height="16" rx="1" fill="currentColor" opacity="0.4" />
        </>
      )}
      {style === 'badge' && (
        <>
          <rect x="4" y="2" width="28" height="32" rx="4" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1" />
          <rect x="10" y="8" width="16" height="16" rx="1" fill="currentColor" opacity="0.4" />
          <rect x="10" y="28" width="16" height="2" rx="1" fill="currentColor" opacity="0.3" />
        </>
      )}
      {style === 'banner' && (
        <>
          <rect x="2" y="4" width="32" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
          <rect x="10" y="8" width="16" height="16" rx="1" fill="currentColor" opacity="0.4" />
          <rect x="8" y="28" width="20" height="2" rx="1" fill="currentColor" opacity="0.3" />
        </>
      )}
    </svg>
  )
}

export function FrameStyleSelector({ value, onChange }: FrameStyleSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Frame Style</Label>
      <div className="grid grid-cols-5 gap-2">
        {FRAME_STYLES.map(({ value: style, label }) => (
          <button
            key={style}
            onClick={() => onChange(style)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all duration-200',
              value === style
                ? 'border-accent bg-accent/5 text-foreground'
                : 'border-border text-muted hover:border-border-hover hover:text-foreground'
            )}
          >
            <FramePreview style={style} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
