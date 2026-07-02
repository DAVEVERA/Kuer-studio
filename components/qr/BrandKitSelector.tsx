'use client'

import { motion } from 'framer-motion'
import { Palette, Check } from 'lucide-react'
import type { BrandKit } from '@/types/brand'

interface BrandKitSelectorProps {
  brandKits: BrandKit[]
  selectedId?: string
  onSelect: (id: string | undefined) => void
  className?: string
}

export function BrandKitSelector({ brandKits, selectedId, onSelect, className }: BrandKitSelectorProps) {
  if (brandKits.length === 0) {
    return (
      <div className={className}>
        <p className="text-xs text-muted">No brand kits yet. Create one in Brand Kits to apply brand colors automatically.</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          type="button"
          onClick={() => onSelect(undefined)}
          className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
            !selectedId
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-white/5 text-muted hover:text-foreground hover:border-white/10'
          }`}
        >
          <span className="text-xs font-medium">No Brand Kit</span>
        </button>
        {brandKits.map((kit, i) => {
          const isSelected = selectedId === kit.id
          return (
            <motion.button
              type="button"
              key={kit.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(isSelected ? undefined : kit.id)}
              className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${
                isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex gap-0.5">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: kit.primary_color }} />
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: kit.secondary_color }} />
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: kit.accent_color }} />
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                {kit.name}
              </span>
              {isSelected && <Check className="w-3 h-3 text-accent" />}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
