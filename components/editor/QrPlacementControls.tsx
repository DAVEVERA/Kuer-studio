'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Move, Maximize, Minimize, RotateCw } from 'lucide-react'

interface QrPlacementControlsProps {
  qrSize: number
  qrPosition: { x: number; y: number }
  onSizeChange: (size: number) => void
  onPositionChange: (pos: { x: number; y: number }) => void
  className?: string
}

const PRESET_POSITIONS = [
  { label: 'Center', x: 0.5, y: 0.5, icon: '⊕' },
  { label: 'Top Left', x: 0.2, y: 0.2, icon: '◤' },
  { label: 'Top Right', x: 0.8, y: 0.2, icon: '◥' },
  { label: 'Bottom Left', x: 0.2, y: 0.8, icon: '◣' },
  { label: 'Bottom Right', x: 0.8, y: 0.8, icon: '◢' },
  { label: 'Bottom Center', x: 0.5, y: 0.8, icon: '▽' },
]

export function QrPlacementControls({
  qrSize,
  qrPosition,
  onSizeChange,
  onPositionChange,
  className,
}: QrPlacementControlsProps) {
  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Size Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-muted flex items-center gap-1.5">
              <Maximize className="w-3 h-3" /> QR Size
            </label>
            <span className="text-xs text-muted">{Math.round(qrSize * 100)}%</span>
          </div>
          <input
            type="range"
            min={15}
            max={80}
            value={Math.round(qrSize * 100)}
            onChange={(e) => onSizeChange(parseInt(e.target.value) / 100)}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-[10px] text-muted/50 mt-1">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        {/* Position Presets */}
        <div>
          <label className="text-xs text-muted flex items-center gap-1.5 mb-2">
            <Move className="w-3 h-3" /> Position
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESET_POSITIONS.map((pos) => {
              const isActive = Math.abs(qrPosition.x - pos.x) < 0.05 && Math.abs(qrPosition.y - pos.y) < 0.05
              return (
                <button
                  key={pos.label}
                  onClick={() => onPositionChange({ x: pos.x, y: pos.y })}
                  className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border text-xs transition-all ${
                    isActive
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-white/5 text-muted hover:text-foreground hover:border-white/10'
                  }`}
                >
                  <span className="text-sm">{pos.icon}</span>
                  <span className="text-[9px]">{pos.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Fine-tune position */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-muted mb-1 block">X Position</label>
            <input
              type="range"
              min={10}
              max={90}
              value={Math.round(qrPosition.x * 100)}
              onChange={(e) => onPositionChange({ ...qrPosition, x: parseInt(e.target.value) / 100 })}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted mb-1 block">Y Position</label>
            <input
              type="range"
              min={10}
              max={90}
              value={Math.round(qrPosition.y * 100)}
              onChange={(e) => onPositionChange({ ...qrPosition, y: parseInt(e.target.value) / 100 })}
              className="w-full accent-accent"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
