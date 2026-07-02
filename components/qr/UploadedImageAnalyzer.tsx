'use client'

import { motion } from 'framer-motion'
import { Eye, Palette, Contrast, Grid3x3, Maximize, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { ImageAnalysis } from '@/services/imageAnalysisService'

interface UploadedImageAnalyzerProps {
  analysis: ImageAnalysis
  className?: string
}

export function UploadedImageAnalyzer({ analysis, className }: UploadedImageAnalyzerProps) {
  const bestZone = analysis.safeZones[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
          <Eye className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Image Analysis</h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Dominant Colors */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Palette className="w-3 h-3 text-muted" />
              <span className="text-xs text-muted">Dominant Colors</span>
            </div>
            <div className="flex gap-1.5">
              {analysis.dominantColors.slice(0, 6).map((color, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative"
                >
                  <div
                    className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {color}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contrast & Luminance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Contrast className="w-3 h-3 text-muted" />
                <span className="text-[10px] text-muted">Contrast Level</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold capitalize ${
                  analysis.contrastLevel === 'high' ? 'text-green-400' :
                  analysis.contrastLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {analysis.contrastLevel}
                </span>
                {analysis.contrastLevel === 'high' ? (
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                )}
              </div>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Maximize className="w-3 h-3 text-muted" />
                <span className="text-[10px] text-muted">Dimensions</span>
              </div>
              <span className="text-sm font-semibold">
                {analysis.dimensions.width}×{analysis.dimensions.height}
              </span>
            </div>
          </div>

          {/* Safe Zones Heatmap */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Grid3x3 className="w-3 h-3 text-muted" />
              <span className="text-xs text-muted">Safe Zones for QR Placement</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {analysis.safeZones.slice(0, 16).map((zone, i) => {
                const gridX = Math.round(zone.x * 4)
                const gridY = Math.round(zone.y * 4)
                const opacity = zone.score / 100
                const isBest = i === 0
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`aspect-square rounded-md flex items-center justify-center text-[9px] font-mono transition-colors ${
                      isBest ? 'ring-1 ring-accent' : ''
                    }`}
                    style={{
                      backgroundColor: zone.score >= 70
                        ? `rgba(16, 185, 129, ${opacity * 0.4})`
                        : zone.score >= 40
                        ? `rgba(245, 158, 11, ${opacity * 0.4})`
                        : `rgba(239, 68, 68, ${opacity * 0.3})`,
                    }}
                    title={`Zone (${gridX},${gridY}): score ${zone.score}`}
                  >
                    {zone.score}
                  </motion.div>
                )
              })}
            </div>
            <p className="text-[10px] text-muted mt-1.5">
              Higher score = better QR placement area. Best zone: {bestZone?.score ?? 0}/100
            </p>
          </div>

          {/* Suggested Colors */}
          <div className="bg-background/50 rounded-lg p-3">
            <span className="text-[10px] text-muted block mb-2">Suggested QR Colors</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded border border-white/10" style={{ backgroundColor: analysis.suggestedQrFgColor }} />
                <span className="text-[10px] font-mono text-muted">FG: {analysis.suggestedQrFgColor}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded border border-white/10" style={{ backgroundColor: analysis.suggestedQrBgColor }} />
                <span className="text-[10px] font-mono text-muted">BG: {analysis.suggestedQrBgColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
