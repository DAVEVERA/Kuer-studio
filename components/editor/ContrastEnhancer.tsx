'use client'

import { useMemo } from 'react'
import { Contrast, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { contrastRatio, checkContrast } from '@/lib/validation/contrastCheck'

interface ContrastEnhancerProps {
  fgColor: string
  bgColor: string
  onFgChange: (color: string) => void
  onBgChange: (color: string) => void
  className?: string
}

const CONTRAST_SUGGESTIONS = [
  { fg: '#000000', bg: '#FFFFFF', label: 'Maximum Contrast' },
  { fg: '#1a1a2e', bg: '#FFFFFF', label: 'Dark Navy' },
  { fg: '#FFFFFF', bg: '#000000', label: 'Inverted' },
  { fg: '#2d3436', bg: '#f5f6fa', label: 'Soft Dark' },
]

export function ContrastEnhancer({ fgColor, bgColor, onFgChange, onBgChange, className }: ContrastEnhancerProps) {
  const ratio = useMemo(() => contrastRatio(fgColor, bgColor), [fgColor, bgColor])
  const status = useMemo(() => checkContrast(fgColor, bgColor), [fgColor, bgColor])

  const StatusIcon = status === 'pass' ? CheckCircle2 : status === 'warning' ? AlertTriangle : XCircle
  const statusColor = status === 'pass' ? 'text-green-400' : status === 'warning' ? 'text-yellow-400' : 'text-red-400'
  const statusBg = status === 'pass' ? 'bg-green-500/10' : status === 'warning' ? 'bg-yellow-500/10' : 'bg-red-500/10'

  return (
    <div className={className}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Contrast className="w-3.5 h-3.5 text-muted" />
          <span className="text-xs text-muted">Contrast Check</span>
        </div>

        {/* Contrast ratio display */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${statusBg}`}>
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-4 h-4 ${statusColor}`} />
            <div>
              <span className={`text-sm font-semibold ${statusColor}`}>
                {ratio.toFixed(1)}:1
              </span>
              <span className="text-[10px] text-muted ml-2">
                {status === 'pass' ? 'Excellent' : status === 'warning' ? 'Marginal' : 'Too Low'}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="w-6 h-6 rounded border border-white/10" style={{ backgroundColor: fgColor }} />
            <div className="w-6 h-6 rounded border border-white/10" style={{ backgroundColor: bgColor }} />
          </div>
        </div>

        {/* Requirements */}
        <div className="text-[10px] text-muted space-y-0.5">
          <div className="flex items-center gap-1">
            {ratio >= 4.5 ? <CheckCircle2 className="w-2.5 h-2.5 text-green-400" /> : <XCircle className="w-2.5 h-2.5 text-red-400" />}
            <span>QR Minimum (4.5:1): {ratio >= 4.5 ? 'Pass' : 'Fail'}</span>
          </div>
          <div className="flex items-center gap-1">
            {ratio >= 7 ? <CheckCircle2 className="w-2.5 h-2.5 text-green-400" /> : <AlertTriangle className="w-2.5 h-2.5 text-yellow-400" />}
            <span>Print Safe (7:1): {ratio >= 7 ? 'Pass' : 'Marginal'}</span>
          </div>
        </div>

        {/* Quick fix suggestions when contrast is low */}
        {status !== 'pass' && (
          <div>
            <span className="text-[10px] text-muted block mb-1.5">Quick fix — apply high-contrast pair:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {CONTRAST_SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s.label}
                  onClick={() => { onFgChange(s.fg); onBgChange(s.bg) }}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex gap-0.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.fg }} />
                    <div className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: s.bg }} />
                  </div>
                  <span className="text-[9px] text-muted">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
