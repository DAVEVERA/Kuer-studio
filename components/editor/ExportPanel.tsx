'use client'

import { motion } from 'framer-motion'
import { Download, Image, FileCode, FileText, Printer, Square, Smartphone, Monitor, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EXPORT_OPTIONS } from '@/lib/constants'
import type { ExportFormat } from '@/types/export'

interface ExportPanelProps {
  onExport: (format: ExportFormat) => void
  onExportAll?: () => void
  isExporting?: boolean
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Image, FileCode, FileText, Printer, Square, Smartphone, Monitor, Layers,
}

export function ExportPanel({ onExport, onExportAll, isExporting }: ExportPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Export Formats</h3>
        {onExportAll && (
          <Button variant="secondary" size="sm" onClick={onExportAll} disabled={isExporting}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {EXPORT_OPTIONS.map((option, i) => {
          const Icon = iconMap[option.icon] || Image
          return (
            <motion.div
              key={option.format}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="p-3 cursor-pointer hover:border-border-hover transition-all duration-200 group"
                onClick={() => onExport(option.format)}
              >
                <div className="flex items-start gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-background flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted group-hover:text-accent transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground">{option.label}</p>
                    <p className="text-[10px] text-muted">{option.dimensions || option.description}</p>
                  </div>
                  <Download className="h-3.5 w-3.5 text-muted/40 group-hover:text-accent transition-colors shrink-0 mt-0.5" />
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
