'use client'

import { motion } from 'framer-motion'
import {
  Square,
  Circle,
  Hexagon,
  Frame,
  Image as ImageIcon,
  Layers,
  Package,
  Monitor,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'

export type FormFactor =
  | 'classic-square'
  | 'rounded-qr'
  | 'soft-pixel'
  | 'dot-matrix'
  | 'pattern-based'
  | 'framed'
  | 'poster-integrated'
  | 'packaging-integrated'
  | 'logo-centered'
  | 'image-texture'
  | 'brand-shape'

interface FormFactorOption {
  id: FormFactor
  label: string
  description: string
  icon: React.ElementType
  safeForScan: boolean
}

const FORM_FACTORS: FormFactorOption[] = [
  { id: 'classic-square', label: 'Classic Square', description: 'Standard square QR with styled modules', icon: Square, safeForScan: true },
  { id: 'rounded-qr', label: 'Rounded QR', description: 'Softened edges and rounded modules', icon: Circle, safeForScan: true },
  { id: 'soft-pixel', label: 'Soft Pixel', description: 'Subtle rounded pixel modules', icon: Layers, safeForScan: true },
  { id: 'dot-matrix', label: 'Dot Matrix', description: 'Circular dot-based modules', icon: Circle, safeForScan: true },
  { id: 'pattern-based', label: 'Pattern-Based', description: 'QR blended with decorative patterns', icon: Hexagon, safeForScan: true },
  { id: 'framed', label: 'Framed QR', description: 'QR within a decorative frame', icon: Frame, safeForScan: true },
  { id: 'poster-integrated', label: 'Poster Integrated', description: 'QR embedded in poster layout', icon: Monitor, safeForScan: true },
  { id: 'packaging-integrated', label: 'Packaging Ready', description: 'Print-safe QR for packaging', icon: Package, safeForScan: true },
  { id: 'logo-centered', label: 'Logo Centered', description: 'Logo overlay in QR center', icon: ImageIcon, safeForScan: true },
  { id: 'image-texture', label: 'Image Texture', description: 'QR with image-derived textures', icon: Sparkles, safeForScan: true },
  { id: 'brand-shape', label: 'Brand Shape', description: 'QR adapted to brand visual identity', icon: Hexagon, safeForScan: false },
]

interface BespokeFormFactorSelectorProps {
  value: FormFactor
  onChange: (value: FormFactor) => void
  className?: string
}

export function BespokeFormFactorSelector({ value, onChange, className }: BespokeFormFactorSelectorProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {FORM_FACTORS.map((ff, i) => {
          const Icon = ff.icon
          const isSelected = value === ff.id
          return (
            <motion.button
              key={ff.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              onClick={() => onChange(ff.id)}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-white/5 bg-panel/50 hover:bg-white/[0.04] text-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-tight">{ff.label}</span>
              {!ff.safeForScan && (
                <div className="absolute top-1.5 right-1.5" title="May affect scanability">
                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export function getModuleStyleForFormFactor(formFactor: FormFactor): { moduleStyle: 'square' | 'rounded' | 'dot' | 'soft-pixel'; cornerStyle: 'square' | 'rounded' | 'extra-rounded' } {
  switch (formFactor) {
    case 'classic-square':
      return { moduleStyle: 'square', cornerStyle: 'square' }
    case 'rounded-qr':
      return { moduleStyle: 'rounded', cornerStyle: 'rounded' }
    case 'soft-pixel':
      return { moduleStyle: 'soft-pixel', cornerStyle: 'rounded' }
    case 'dot-matrix':
      return { moduleStyle: 'dot', cornerStyle: 'extra-rounded' }
    case 'pattern-based':
      return { moduleStyle: 'soft-pixel', cornerStyle: 'rounded' }
    case 'framed':
      return { moduleStyle: 'rounded', cornerStyle: 'rounded' }
    case 'poster-integrated':
      return { moduleStyle: 'soft-pixel', cornerStyle: 'rounded' }
    case 'packaging-integrated':
      return { moduleStyle: 'square', cornerStyle: 'square' }
    case 'logo-centered':
      return { moduleStyle: 'rounded', cornerStyle: 'rounded' }
    case 'image-texture':
      return { moduleStyle: 'soft-pixel', cornerStyle: 'rounded' }
    case 'brand-shape':
      return { moduleStyle: 'rounded', cornerStyle: 'extra-rounded' }
    default:
      return { moduleStyle: 'square', cornerStyle: 'square' }
  }
}
