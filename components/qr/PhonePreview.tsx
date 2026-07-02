'use client'

import { motion } from 'framer-motion'

interface PhonePreviewProps {
  children: React.ReactNode
  className?: string
}

export function PhonePreview({ children, className }: PhonePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <div className="relative mx-auto w-[260px]">
        {/* Phone frame */}
        <div className="relative rounded-[2.5rem] border-[3px] border-white/10 bg-[#1a1a2e] p-2 shadow-2xl shadow-black/40">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#1a1a2e] rounded-b-2xl z-10 flex items-center justify-center">
            <div className="w-16 h-3 rounded-full bg-black/40" />
          </div>

          {/* Screen */}
          <div className="relative rounded-[2rem] overflow-hidden bg-black aspect-[9/19.5]">
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-2 text-[8px] text-white/60">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                  <rect x="0" y="4" width="2" height="4" rx="0.5" />
                  <rect x="3" y="2.5" width="2" height="5.5" rx="0.5" />
                  <rect x="6" y="1" width="2" height="7" rx="0.5" />
                  <rect x="9" y="0" width="2" height="8" rx="0.5" />
                </svg>
                <svg width="14" height="8" viewBox="0 0 14 8" fill="currentColor">
                  <rect x="0.5" y="0.5" width="11" height="7" rx="1" stroke="currentColor" strokeWidth="0.5" fill="none" />
                  <rect x="2" y="2" width="7" height="4" rx="0.5" />
                  <rect x="12" y="2.5" width="1.5" height="3" rx="0.5" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 pt-8">
              {children}
            </div>
          </div>
        </div>

        {/* Reflection */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  )
}

export function PhoneQrPreview({ qrDataUrl, label }: { qrDataUrl?: string; label?: string }) {
  return (
    <PhonePreview>
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0B1117] to-[#111A22] p-4">
        <div className="w-full max-w-[180px] aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Preview" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <rect width="5" height="5" x="3" y="3" rx="1" />
                  <rect width="5" height="5" x="16" y="3" rx="1" />
                  <rect width="5" height="5" x="3" y="16" rx="1" />
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                  <path d="M21 21v.01" />
                  <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                </svg>
              </div>
              <p className="text-[10px] text-muted">QR Preview</p>
            </div>
          )}
        </div>
        {label && (
          <p className="text-[10px] text-muted mt-3 text-center">{label}</p>
        )}
        <div className="mt-4 w-full px-2">
          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-400">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span className="text-[9px] font-semibold text-green-400">Scannable</span>
          </div>
        </div>
      </div>
    </PhonePreview>
  )
}
