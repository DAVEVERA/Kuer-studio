'use client'

import { motion } from 'framer-motion'
import { Shield, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QrScanabilityMeter } from './QrScanabilityMeter'
import type { ValidationReport } from '@/types/qr'

interface QrValidationPanelProps {
  report: ValidationReport
  isDemo?: boolean
  className?: string
}

const statusConfig = {
  pass: { icon: CheckCircle2, variant: 'success' as const, label: 'Pass' },
  warning: { icon: AlertTriangle, variant: 'warning' as const, label: 'Warning' },
  fail: { icon: XCircle, variant: 'destructive' as const, label: 'Fail' },
}

function CheckRow({ label, status }: { label: string; status: 'pass' | 'warning' | 'fail' }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    </div>
  )
}

export function QrValidationPanel({ report, isDemo = true, className }: QrValidationPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-accent" />
              Scanability Report
            </CardTitle>
            {isDemo && (
              <Badge variant="outline" className="gap-1 text-[10px]">
                <Info className="h-3 w-3" />
                Demo Validation
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <QrScanabilityMeter score={report.score} size={100} />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">URL Match</span>
                <Badge variant={report.urlMatches ? 'success' : 'destructive'}>
                  {report.urlMatches ? 'Yes' : 'No'}
                </Badge>
              </div>
              {report.decodedUrl && (
                <p className="text-xs text-muted/70 truncate max-w-[200px]">{report.decodedUrl}</p>
              )}
            </div>
          </div>

          <div className="space-y-0">
            <CheckRow label="Contrast" status={report.checks.contrast} />
            <CheckRow label="Quiet Zone" status={report.checks.quietZone} />
            <CheckRow label="Finder Patterns" status={report.checks.finderPatterns} />
            <CheckRow label="Resolution" status={report.checks.resolution} />
          </div>

          {report.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted uppercase tracking-wider">Recommendations</h4>
              <ul className="space-y-1">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-muted flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
