'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { StylePreset } from '@/types/qr'

interface QrStylePresetCardProps {
  preset: StylePreset
  selected?: boolean
  onClick?: () => void
}

export function QrStylePresetCard({ preset, selected, onClick }: QrStylePresetCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative w-full text-left rounded-xl border-2 p-3 transition-all duration-200 bg-panel overflow-hidden group',
        selected
          ? 'border-accent shadow-lg shadow-accent/15'
          : 'border-border hover:border-border-hover'
      )}
    >
      <div
        className="h-2 rounded-full mb-3 opacity-80"
        style={{
          background: `linear-gradient(to right, ${preset.previewColors.join(', ')})`,
        }}
      />

      <div className="space-y-1">
        <h4 className="text-sm font-medium text-foreground">{preset.name}</h4>
        <p className="text-[11px] text-muted leading-snug line-clamp-2">{preset.description}</p>
      </div>

      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent"
        />
      )}
    </motion.button>
  )
}
