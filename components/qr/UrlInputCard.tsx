'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Link2, CheckCircle2, AlertCircle } from 'lucide-react'
import { isValidUrl, normalizeUrl } from '@/lib/utils'

interface UrlInputCardProps {
  value: string
  onChange: (url: string) => void
  error?: string
  className?: string
}

export function UrlInputCard({ value, onChange, error, className }: UrlInputCardProps) {
  const [focused, setFocused] = useState(false)
  const isValid = value.length > 0 && isValidUrl(value)
  const showError = error || (value.length > 0 && !isValid && !focused)

  return (
    <div className={className}>
      <div className="glass rounded-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4"
          >
            <Globe className="w-7 h-7 text-accent" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Enter your URL</h2>
          <p className="text-muted">Paste the URL you want to encode in your branded QR code</p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Link2 className={`w-4 h-4 transition-colors ${
                isValid ? 'text-green-400' : value.length > 0 ? 'text-muted' : 'text-muted/50'
              }`} />
            </div>
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="example.com"
              className={`w-full pl-11 pr-12 py-3.5 rounded-xl bg-background border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 text-lg transition-colors ${
                showError
                  ? 'border-red-400/50 focus:border-red-400/50 focus:ring-red-400/20'
                  : isValid
                  ? 'border-green-400/30 focus:border-green-400/50 focus:ring-green-400/20'
                  : 'border-white/10 focus:border-accent/50 focus:ring-accent/20'
              }`}
              autoFocus
            />
            {isValid && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </motion.div>
            )}
          </div>

          {showError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 mt-2 text-red-400"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <p className="text-sm">{error || 'Please enter a valid URL (e.g. https://example.com)'}</p>
            </motion.div>
          )}

          {value && isValid && (
            <p className="text-xs text-green-400/70 mt-2 font-mono">{normalizeUrl(value)}</p>
          )}
          <p className="text-xs text-muted mt-2">
            Typ gewoon je domeinnaam — https:// wordt automatisch toegevoegd.
          </p>
        </div>
      </div>
    </div>
  )
}
