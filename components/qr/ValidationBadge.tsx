'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, Shield, Loader2 } from 'lucide-react'
import type { ValidationStatus } from '@/types/qr'

interface ValidationBadgeProps {
  status: ValidationStatus
  score?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const STATUS_CONFIG: Record<ValidationStatus, {
  icon: React.ElementType
  label: string
  color: string
  bg: string
}> = {
  validated: { icon: CheckCircle2, label: 'Validated', color: 'text-green-400', bg: 'bg-green-500/10' },
  'needs-contrast-improvement': { icon: AlertTriangle, label: 'Needs Contrast', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  'quiet-zone-too-small': { icon: AlertTriangle, label: 'Quiet Zone Issue', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  'finder-pattern-damaged': { icon: XCircle, label: 'Pattern Damaged', color: 'text-red-400', bg: 'bg-red-500/10' },
  'low-scan-confidence': { icon: AlertTriangle, label: 'Low Confidence', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  'not-scannable': { icon: XCircle, label: 'Not Scannable', color: 'text-red-400', bg: 'bg-red-500/10' },
  pending: { icon: Loader2, label: 'Pending', color: 'text-muted', bg: 'bg-panel' },
}

const SIZE_CLASSES = {
  sm: { icon: 'w-3 h-3', text: 'text-[10px]', padding: 'px-1.5 py-0.5', gap: 'gap-1' },
  md: { icon: 'w-3.5 h-3.5', text: 'text-xs', padding: 'px-2 py-1', gap: 'gap-1.5' },
  lg: { icon: 'w-4 h-4', text: 'text-sm', padding: 'px-3 py-1.5', gap: 'gap-2' },
}

export function ValidationBadge({ status, score, size = 'md', showLabel = true, className }: ValidationBadgeProps) {
  const config = STATUS_CONFIG[status]
  const sizes = SIZE_CLASSES[size]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center ${sizes.gap} ${sizes.padding} rounded-full ${config.bg} ${className ?? ''}`}
    >
      <Icon className={`${sizes.icon} ${config.color} ${status === 'pending' ? 'animate-spin' : ''}`} />
      {showLabel && (
        <span className={`${sizes.text} font-medium ${config.color}`}>
          {config.label}
        </span>
      )}
      {score !== undefined && (
        <span className={`${sizes.text} font-bold ${config.color}`}>
          {score}/100
        </span>
      )}
    </motion.div>
  )
}

export function ProductionReadyBadge({ score, className }: { score: number; className?: string }) {
  const isReady = score >= 80
  const isExcellent = score >= 90

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
        isExcellent ? 'bg-green-500/10 border border-green-500/20' :
        isReady ? 'bg-yellow-500/10 border border-yellow-500/20' :
        'bg-red-500/10 border border-red-500/20'
      } ${className ?? ''}`}
    >
      <Shield className={`w-4 h-4 ${
        isExcellent ? 'text-green-400' : isReady ? 'text-yellow-400' : 'text-red-400'
      }`} />
      <div>
        <span className={`text-xs font-semibold ${
          isExcellent ? 'text-green-400' : isReady ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {isExcellent ? 'Production Ready' : isReady ? 'Usable' : 'Not Production Ready'}
        </span>
        <span className="text-[10px] text-muted ml-2">Score: {score}/100</span>
      </div>
    </motion.div>
  )
}
