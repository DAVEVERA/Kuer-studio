'use client'

import { motion } from 'framer-motion'
import { Shield, Eye, Palette, Award } from 'lucide-react'
import type { QrScorecard } from '@/lib/scoring/scoringEngine'

interface QrScorecardPanelProps {
  scorecard: QrScorecard
  className?: string
}

function ScoreGauge({ score, label, icon: Icon, color }: {
  score: number
  label: string
  icon: React.ElementType
  color: string
}) {
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="currentColor"
            className="text-white/5"
            strokeWidth="6"
          />
          <motion.circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-4 h-4 mb-0.5" style={{ color }} />
          <span className="text-sm font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-[10px] text-muted font-medium">{label}</span>
    </div>
  )
}

export function QrScorecardPanel({ scorecard, className = '' }: QrScorecardPanelProps) {
  const getColor = (score: number) => {
    if (score >= 90) return '#4ade80'
    if (score >= 70) return '#facc15'
    return '#f87171'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-5 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-4 h-4 text-accent" />
        <h3 className="font-semibold text-sm">QR Scorecard</h3>
        <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
          scorecard.compositeScore >= 90 ? 'bg-green-500/10 text-green-400' :
          scorecard.compositeScore >= 70 ? 'bg-yellow-500/10 text-yellow-400' :
          'bg-red-500/10 text-red-400'
        }`}>
          {scorecard.compositeScore}/100
        </span>
      </div>

      <div className="flex justify-around">
        <ScoreGauge
          score={scorecard.scanScore}
          label="Scan"
          icon={Shield}
          color={getColor(scorecard.scanScore)}
        />
        <ScoreGauge
          score={scorecard.visualScore}
          label="Visual"
          icon={Eye}
          color={getColor(scorecard.visualScore)}
        />
        <ScoreGauge
          score={scorecard.brandMatchScore}
          label="Brand"
          icon={Palette}
          color={getColor(scorecard.brandMatchScore)}
        />
      </div>

      {scorecard.compositeScore >= 90 && (
        <div className="mt-4 text-center">
          <span className="text-xs text-green-400 font-medium">Production Ready</span>
        </div>
      )}
    </motion.div>
  )
}
