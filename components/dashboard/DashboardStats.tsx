'use client'

import { motion } from 'framer-motion'
import { QrCode, ShieldCheck, BarChart3, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'

interface StatItem {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  trend?: number
}

interface DashboardStatsProps {
  totalQrCodes: number
  validatedDesigns: number
  totalScans: number
  bestScore: number
}

export function DashboardStats({ totalQrCodes, validatedDesigns, totalScans, bestScore }: DashboardStatsProps) {
  const stats: StatItem[] = [
    { label: 'Total QR Codes', value: totalQrCodes, icon: QrCode, trend: 12 },
    { label: 'Validated Designs', value: validatedDesigns, icon: ShieldCheck, trend: 8 },
    { label: 'Total Scans', value: totalScans, icon: BarChart3, trend: 24 },
    { label: 'Best Score', value: bestScore, icon: Trophy },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(stat.value)}</p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5 text-accent" />
                </div>
              </div>
              {stat.trend !== undefined && (
                <p className="text-[10px] text-emerald-400 mt-2">
                  +{stat.trend}% from last month
                </p>
              )}
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
