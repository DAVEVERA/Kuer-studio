'use client'

import { Label } from '@/components/ui/label'

interface ColorControlsProps {
  fgColor: string
  bgColor: string
  brandColors?: string[]
  onFgChange: (color: string) => void
  onBgChange: (color: string) => void
}

export function ColorControls({ fgColor, bgColor, brandColors = [], onFgChange, onBgChange }: ColorControlsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Foreground Color</Label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={fgColor}
              onChange={(e) => onFgChange(e.target.value)}
              className="h-10 w-10 rounded-md border border-border cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
            />
          </div>
          <input
            type="text"
            value={fgColor}
            onChange={(e) => onFgChange(e.target.value)}
            className="h-10 w-28 rounded-md bg-background border border-border px-3 text-sm text-foreground font-mono uppercase"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Background Color</Label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => onBgChange(e.target.value)}
              className="h-10 w-10 rounded-md border border-border cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
            />
          </div>
          <input
            type="text"
            value={bgColor}
            onChange={(e) => onBgChange(e.target.value)}
            className="h-10 w-28 rounded-md bg-background border border-border px-3 text-sm text-foreground font-mono uppercase"
          />
        </div>
      </div>

      {brandColors.length > 0 && (
        <div className="space-y-2">
          <Label>Brand Colors</Label>
          <div className="flex flex-wrap gap-2">
            {brandColors.map((color) => (
              <button
                key={color}
                onClick={() => onFgChange(color)}
                className="h-8 w-8 rounded-md border-2 border-border hover:border-accent transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => { onFgChange('#000000'); onBgChange('#FFFFFF') }}
          className="flex-1 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:border-border-hover transition-colors"
        >
          Reset Default
        </button>
        <button
          onClick={() => { const tmp = fgColor; onFgChange(bgColor); onBgChange(tmp) }}
          className="flex-1 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:border-border-hover transition-colors"
        >
          Swap Colors
        </button>
      </div>
    </div>
  )
}
