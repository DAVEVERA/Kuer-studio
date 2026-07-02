'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, User, Package, Building2, Zap,
  Shapes, Box, BookOpen, ChevronDown,
} from 'lucide-react'
import { getAllQrModes } from '@/lib/ai/qrModes'
import type { QrModeId, StyleVariation } from '@/types/qrModes'

const ICONS: Record<string, React.ElementType> = {
  Briefcase, User, Package, Building2, Zap, Shapes, Box, BookOpen,
}

interface QrModeSelectorProps {
  selectedMode: QrModeId | null
  selectedVariation: string | null
  onModeSelect: (modeId: QrModeId) => void
  onVariationSelect: (variationId: string) => void
}

export function QrModeSelector({
  selectedMode,
  selectedVariation,
  onModeSelect,
  onVariationSelect,
}: QrModeSelectorProps) {
  const [expandedMode, setExpandedMode] = useState<QrModeId | null>(selectedMode)
  const modes = getAllQrModes()

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {modes.map((mode) => {
          const Icon = ICONS[mode.icon] ?? Shapes
          const isSelected = selectedMode === mode.id
          const isExpanded = expandedMode === mode.id

          return (
            <div key={mode.id} className="contents">
              <button
                type="button"
                onClick={() => {
                  onModeSelect(mode.id)
                  setExpandedMode(isExpanded ? null : mode.id)
                }}
                className={`relative rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                    : 'border-white/5 bg-panel/50 hover:bg-white/[0.04] hover:border-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-accent' : 'text-muted'}`} />
                <h4 className="text-xs font-semibold">{mode.name}</h4>
                <p className="text-[10px] text-muted mt-0.5 line-clamp-2">{mode.description}</p>
                {isSelected && (
                  <ChevronDown className={`absolute top-3 right-3 w-3 h-3 text-accent transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Expanded style variations */}
      <AnimatePresence>
        {expandedMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl p-4">
              <h4 className="text-xs font-medium text-muted mb-3">
                Style Variations — {modes.find(m => m.id === expandedMode)?.name}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {modes.find(m => m.id === expandedMode)?.styleVariations.map((variation) => (
                  <button
                    key={variation.id}
                    type="button"
                    onClick={() => onVariationSelect(variation.id)}
                    className={`rounded-lg border overflow-hidden transition-all ${
                      selectedVariation === variation.id
                        ? 'border-accent ring-1 ring-accent/30'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div
                      className="h-10"
                      style={{
                        background: `linear-gradient(135deg, ${variation.previewColors[0]}, ${variation.previewColors[1] ?? variation.previewColors[0]}, ${variation.previewColors[2] ?? variation.previewColors[0]})`,
                      }}
                    />
                    <div className="p-2 bg-panel/80">
                      <span className="text-[10px] font-semibold">{variation.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
