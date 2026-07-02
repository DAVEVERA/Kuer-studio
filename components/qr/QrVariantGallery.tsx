'use client'

import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'
import { QrVariantCard } from './QrVariantCard'
import type { QrVariant } from '@/types/qr'

interface QrVariantGalleryProps {
  variants: QrVariant[]
  selectedId?: string
  onSelect: (id: string) => void
  isGenerating?: boolean
}

export function QrVariantGallery({ variants, selectedId, onSelect, isGenerating }: QrVariantGalleryProps) {
  if (isGenerating) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          <span>Generating AI variants...</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 }}
              className="aspect-square rounded-xl bg-panel border border-border animate-pulse"
            >
              <div className="h-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-accent/20" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (variants.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Generated Variants</h3>
      <div className="grid grid-cols-2 gap-3">
        {variants.map((variant, i) => (
          <QrVariantCard
            key={variant.id}
            variant={variant}
            selected={selectedId === variant.id}
            onClick={() => onSelect(variant.id)}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}
