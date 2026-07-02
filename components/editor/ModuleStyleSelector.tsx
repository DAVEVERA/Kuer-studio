'use client'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { MODULE_STYLES } from '@/lib/constants'
import type { ModuleStyle } from '@/types/qr'

interface ModuleStyleSelectorProps {
  value: ModuleStyle
  onChange: (style: ModuleStyle) => void
}

function ModulePreview({ style }: { style: ModuleStyle }) {
  const size = 6
  const gap = 2
  return (
    <svg width="32" height="32" viewBox="0 0 32 32">
      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 3 }).map((_, col) => {
          if (row === 1 && col === 1) return null
          const x = 4 + col * (size + gap)
          const y = 4 + row * (size + gap)
          switch (style) {
            case 'rounded':
              return <rect key={`${row}-${col}`} x={x} y={y} width={size} height={size} rx={1.5} fill="currentColor" />
            case 'dot':
              return <circle key={`${row}-${col}`} cx={x + size / 2} cy={y + size / 2} r={size * 0.4} fill="currentColor" />
            case 'soft-pixel':
              return <rect key={`${row}-${col}`} x={x + 0.5} y={y + 0.5} width={size - 1} height={size - 1} rx={1} fill="currentColor" />
            default:
              return <rect key={`${row}-${col}`} x={x} y={y} width={size} height={size} fill="currentColor" />
          }
        })
      )}
    </svg>
  )
}

export function ModuleStyleSelector({ value, onChange }: ModuleStyleSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Module Style</Label>
      <div className="grid grid-cols-4 gap-2">
        {MODULE_STYLES.map(({ value: style, label }) => (
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
            <ModulePreview style={style} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
