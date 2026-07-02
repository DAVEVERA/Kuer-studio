'use client'

import { motion } from 'framer-motion'
import {
  Wrench,
  Eye,
  Contrast,
  Square,
  Maximize,
  Layers,
  Paintbrush,
  RefreshCw,
  Move,
  CheckCircle2,
} from 'lucide-react'
import type { ValidationReport } from '@/types/qr'

export type RepairAction =
  | 'increase-contrast'
  | 'restore-finder-patterns'
  | 'add-quiet-zone'
  | 'reduce-overlay'
  | 'simplify-artwork'
  | 'rebuild-modules'
  | 'regenerate-variant'
  | 'move-qr-position'

interface RepairOption {
  id: RepairAction
  label: string
  description: string
  icon: React.ElementType
}

const ALL_REPAIRS: RepairOption[] = [
  { id: 'increase-contrast', label: 'Increase Contrast', description: 'Boost contrast between QR modules and background', icon: Contrast },
  { id: 'restore-finder-patterns', label: 'Restore Finder Patterns', description: 'Redraw clear finder patterns at corners', icon: Square },
  { id: 'add-quiet-zone', label: 'Add Quiet Zone', description: 'Ensure sufficient whitespace around QR code', icon: Maximize },
  { id: 'reduce-overlay', label: 'Reduce Image Overlay', description: 'Lower opacity of artwork over QR data', icon: Layers },
  { id: 'simplify-artwork', label: 'Simplify Artwork', description: 'Remove complex textures near critical zones', icon: Paintbrush },
  { id: 'rebuild-modules', label: 'Rebuild QR Modules', description: 'Regenerate QR module structure from scratch', icon: RefreshCw },
  { id: 'regenerate-variant', label: 'Regenerate Safer Variant', description: 'Generate a new variant with safer settings', icon: Eye },
  { id: 'move-qr-position', label: 'Move QR Position', description: 'Relocate QR to a better area of the image', icon: Move },
]

interface AutoRepairPanelProps {
  report: ValidationReport
  onRepair: (action: RepairAction) => void
  isRepairing?: boolean
  className?: string
}

function getRelevantRepairs(report: ValidationReport): RepairOption[] {
  const repairs: RepairOption[] = []

  if (report.checks.contrast === 'fail' || report.checks.contrast === 'warning') {
    repairs.push(ALL_REPAIRS.find(r => r.id === 'increase-contrast')!)
  }
  if (report.checks.finderPatterns === 'fail' || report.checks.finderPatterns === 'warning') {
    repairs.push(ALL_REPAIRS.find(r => r.id === 'restore-finder-patterns')!)
  }
  if (report.checks.quietZone === 'fail' || report.checks.quietZone === 'warning') {
    repairs.push(ALL_REPAIRS.find(r => r.id === 'add-quiet-zone')!)
  }
  if (report.score < 80) {
    repairs.push(ALL_REPAIRS.find(r => r.id === 'reduce-overlay')!)
    repairs.push(ALL_REPAIRS.find(r => r.id === 'simplify-artwork')!)
  }
  if (report.score < 70) {
    repairs.push(ALL_REPAIRS.find(r => r.id === 'rebuild-modules')!)
  }

  repairs.push(ALL_REPAIRS.find(r => r.id === 'regenerate-variant')!)
  repairs.push(ALL_REPAIRS.find(r => r.id === 'move-qr-position')!)

  return repairs
}

export function AutoRepairPanel({ report, onRepair, isRepairing, className }: AutoRepairPanelProps) {
  if (report.score >= 90) {
    return (
      <div className={className}>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <h3 className="font-semibold text-sm">QR Code is Production Ready</h3>
              <p className="text-xs text-muted mt-0.5">Score {report.score}/100 — no repairs needed</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const repairs = getRelevantRepairs(report)

  return (
    <div className={className}>
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-sm">Auto Repair Options</h3>
        </div>
        <p className="text-xs text-muted mb-4">
          Score {report.score}/100 — select a repair to improve scanability
        </p>
        <div className="space-y-2">
          {repairs.map((repair, i) => {
            const Icon = repair.icon
            return (
              <motion.button
                key={repair.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => onRepair(repair.id)}
                disabled={isRepairing}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors text-left disabled:opacity-50 group"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium block">{repair.label}</span>
                  <span className="text-[10px] text-muted">{repair.description}</span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
