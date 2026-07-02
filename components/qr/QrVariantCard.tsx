'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { QrVariant } from '@/types/qr'

interface QrVariantCardProps {
  variant: QrVariant
  selected?: boolean
  onClick?: () => void
  index?: number
}

export function QrVariantCard({ variant, selected, onClick, index = 0 }: QrVariantCardProps) {
  const scoreColor = variant.scanability_score >= 90 ? 'success' : variant.scanability_score >= 80 ? 'warning' : 'destructive'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn(
        'relative group cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden bg-panel',
        selected
          ? 'border-accent shadow-lg shadow-accent/20'
          : 'border-border hover:border-border-hover'
      )}
    >
      <div className="aspect-square bg-background/30 flex items-center justify-center p-4">
        {variant.image_url ? (
          <img
            src={variant.image_url}
            alt={variant.style_preset}
            className="w-full h-full object-contain rounded-md"
          />
        ) : (
          <div className="w-full h-full rounded-md bg-gradient-to-br from-accent/20 via-deep-blue/30 to-peach/20 flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 80 80" className="text-muted/30">
              <rect x="4" y="4" width="24" height="24" rx="2" fill="currentColor" />
              <rect x="52" y="4" width="24" height="24" rx="2" fill="currentColor" />
              <rect x="4" y="52" width="24" height="24" rx="2" fill="currentColor" />
              <rect x="36" y="36" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="52" y="36" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="36" y="52" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="52" y="52" width="24" height="24" rx="2" fill="currentColor" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground truncate">
            {variant.style_preset.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <Badge variant={scoreColor} className="text-[10px] px-1.5 py-0">
            {variant.scanability_score}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {variant.validation_status === 'validated' ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Demo Validated
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-yellow-400">
              <AlertTriangle className="h-3 w-3" />
              {variant.validation_status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}
        </div>
      </div>

      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 bg-accent rounded-full p-1"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
        </motion.div>
      )}
    </motion.div>
  )
}
