'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Palette,
  Type,
  Maximize,
  Square,
  Circle,
  Image,
  Shield,
  Layers,
} from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { QrCodeRenderer } from '@/components/qr/QrCodeRenderer'
import { AutoRepairPanel, type RepairAction } from '@/components/qr/AutoRepairPanel'
import { ContrastEnhancer } from '@/components/editor/ContrastEnhancer'
import { ExportPanel } from '@/components/editor/ExportPanel'
import { formatDate } from '@/lib/utils'
import { exportQr } from '@/services/exportService'
import { generateQr } from '@/services/qrGenerator'
import type { ModuleStyle, CornerStyle, FrameStyle, ValidationReport } from '@/types/qr'
import type { ExportFormat } from '@/types/export'
import { use } from 'react'

const mockProject = {
  id: 'proj-1',
  name: 'Spotify Podcast Launch',
  url: 'https://open.spotify.com/show/example',
  type: 'dynamic' as const,
  category: 'podcast',
  shortId: 'abc123',
  created: '2026-06-18T10:00:00Z',
  updated: '2026-06-20T10:30:00Z',
}

function makeValidationReport(score: number, overrides?: Partial<ValidationReport['checks']>): ValidationReport {
  const checks: ValidationReport['checks'] = {
    contrast: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
    quietZone: score >= 80 ? 'pass' : 'warning',
    finderPatterns: score >= 75 ? 'pass' : score >= 60 ? 'warning' : 'fail',
    resolution: 'pass',
    ...overrides,
  }
  return {
    isScannable: score >= 80,
    decodedUrl: mockProject.url,
    urlMatches: true,
    score,
    checks,
    recommendations: score >= 90
      ? ['QR code meets all scanability requirements']
      : ['Consider improving contrast for better scan reliability'],
  }
}

interface VariantData {
  id: string
  name: string
  fgColor: string
  bgColor: string
  moduleStyle: ModuleStyle
  cornerStyle: CornerStyle
  score: number
  report: ValidationReport
}

const initialVariants: VariantData[] = [
  { id: 'v1', name: 'Variant A', fgColor: '#6c63ff', bgColor: '#FFFFFF', moduleStyle: 'rounded', cornerStyle: 'rounded', score: 94, report: makeValidationReport(94) },
  { id: 'v2', name: 'Variant B', fgColor: '#1DB954', bgColor: '#FFFFFF', moduleStyle: 'dot', cornerStyle: 'extra-rounded', score: 91, report: makeValidationReport(91) },
  { id: 'v3', name: 'Variant C', fgColor: '#0a192f', bgColor: '#e8f0fe', moduleStyle: 'soft-pixel', cornerStyle: 'rounded', score: 87, report: makeValidationReport(87, { contrast: 'warning' }) },
  { id: 'v4', name: 'Variant D', fgColor: '#d4af37', bgColor: '#1a1a2e', moduleStyle: 'rounded', cornerStyle: 'rounded', score: 78, report: makeValidationReport(78, { contrast: 'fail' }) },
]

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [fgColor, setFgColor] = useState(initialVariants[0].fgColor)
  const [bgColor, setBgColor] = useState(initialVariants[0].bgColor)
  const [ctaText, setCtaText] = useState('Scan Me')
  const [moduleStyle, setModuleStyle] = useState<ModuleStyle>(initialVariants[0].moduleStyle)
  const [cornerStyle, setCornerStyle] = useState<CornerStyle>(initialVariants[0].cornerStyle)
  const [quietZone, setQuietZone] = useState(4)
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('none')
  const [logoUrl, setLogoUrl] = useState<string>()
  const [logoSize, setLogoSize] = useState(18)
  const [activeTab, setActiveTab] = useState<'style' | 'colors' | 'frame' | 'export'>('style')

  const variant = initialVariants[selectedVariant]

  const handleVariantSelect = (index: number) => {
    setSelectedVariant(index)
    const v = initialVariants[index]
    setFgColor(v.fgColor)
    setBgColor(v.bgColor)
    setModuleStyle(v.moduleStyle)
    setCornerStyle(v.cornerStyle)
  }

  const handleExport = async (format: ExportFormat) => {
    try {
      const qrResult = await generateQr(mockProject.url, {
        targetUrl: mockProject.url,
        fgColor,
        bgColor,
        brandColors: [],
        logoSize,
        quietZone,
        ctaText,
        frameStyle,
        cornerStyle,
        moduleStyle,
        errorCorrection: 'H',
      })

      await exportQr({
        format,
        qrDataUrl: qrResult.dataUrl,
        targetUrl: mockProject.url,
        projectName: mockProject.name,
        ctaText,
        fgColor,
        bgColor,
      })
    } catch (e) {
      console.error('Export failed:', e)
    }
  }

  const handleRepair = (action: RepairAction) => {
    switch (action) {
      case 'increase-contrast':
        setFgColor('#000000')
        setBgColor('#FFFFFF')
        break
      case 'add-quiet-zone':
        setQuietZone(Math.min(8, quietZone + 2))
        break
      case 'restore-finder-patterns':
        setCornerStyle('square')
        break
      case 'rebuild-modules':
        setModuleStyle('square')
        setCornerStyle('square')
        break
    }
  }

  const statusColor = (s: string) => s === 'pass' ? 'text-green-400' : s === 'warning' ? 'text-yellow-400' : 'text-red-400'
  const statusIcon = (s: string) => s === 'pass' ? CheckCircle2 : AlertTriangle

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/projects" className="p-2 rounded-lg glass hover:bg-white/[0.04] transition-colors" title="Back to projects">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">{mockProject.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted truncate max-w-[200px]">{mockProject.url}</span>
                <button type="button" onClick={() => navigator.clipboard.writeText(mockProject.url)} className="text-muted hover:text-foreground transition-colors">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg glass text-sm hover:bg-white/[0.04] transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
            <button type="button" onClick={() => handleExport('png-1024')} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,380px] gap-6">
          {/* Left: Preview + Variants */}
          <div className="space-y-6">
            {/* Main Preview — Real QR Code */}
            <motion.div
              key={`${selectedVariant}-${fgColor}-${bgColor}-${moduleStyle}-${cornerStyle}-${quietZone}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-center p-8 min-h-[400px]" style={{ backgroundColor: bgColor === '#FFFFFF' ? '#f5f5f5' : '#1a1a2e' }}>
                <div className="relative">
                  <QrCodeRenderer
                    url={mockProject.url}
                    size={400}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    moduleStyle={moduleStyle}
                    cornerStyle={cornerStyle}
                    quietZone={quietZone * 6}
                    errorCorrection="H"
                    logoUrl={logoUrl}
                    logoSize={logoSize}
                    className="rounded-lg shadow-xl"
                  />
                  {ctaText && (
                    <div className="absolute -bottom-8 inset-x-0 flex justify-center">
                      <span className="px-4 py-1.5 rounded-full bg-black/20 backdrop-blur text-foreground text-sm font-medium">
                        {ctaText}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Variant Selector */}
            <div className="grid grid-cols-4 gap-3">
              {initialVariants.map((v, i) => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => handleVariantSelect(i)}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${
                    selectedVariant === i ? 'border-accent' : 'border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="aspect-square relative flex items-center justify-center p-2" style={{ backgroundColor: v.bgColor === '#FFFFFF' ? '#f0f0f0' : '#111' }}>
                    <QrCodeRenderer
                      url={mockProject.url}
                      size={80}
                      fgColor={v.fgColor}
                      bgColor={v.bgColor}
                      moduleStyle={v.moduleStyle}
                      cornerStyle={v.cornerStyle}
                      quietZone={8}
                      errorCorrection="H"
                    />
                    <div className="absolute bottom-1 right-1">
                      <span className={`text-[9px] font-bold px-1 rounded ${
                        v.score >= 90 ? 'bg-green-500/30 text-green-300' : v.score >= 80 ? 'bg-yellow-500/30 text-yellow-300' : 'bg-red-500/30 text-red-300'
                      }`}>
                        {v.score}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Validation Panel */}
            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  Validation Report
                </h3>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  variant.score >= 90 ? 'bg-green-500/10 text-green-400' : variant.score >= 80 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  Score: {variant.score}/100
                </span>
              </div>
              <div className="space-y-3">
                {Object.entries(variant.report.checks).map(([key, status]) => {
                  const Icon = statusIcon(status)
                  const label = key === 'quietZone' ? 'Quiet Zone' :
                    key === 'finderPatterns' ? 'Finder Patterns' :
                    key.charAt(0).toUpperCase() + key.slice(1)
                  return (
                    <div key={key} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-muted">{label}</span>
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${statusColor(status)}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                  )
                })}
                <div className="flex items-center justify-between py-1.5 border-t border-white/5 mt-2 pt-3">
                  <span className="text-sm text-muted">URL Match</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Match
                  </span>
                </div>
              </div>
            </div>

            {/* Auto Repair Panel (if score < 90) */}
            {variant.score < 90 && (
              <AutoRepairPanel
                report={variant.report}
                onRepair={handleRepair}
              />
            )}
          </div>

          {/* Right: Editor Panel */}
          <div className="space-y-4">
            {/* Tab Switcher */}
            <div className="glass rounded-xl p-1 flex gap-1">
              {(['style', 'colors', 'frame', 'export'] as const).map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${
                    activeTab === tab ? 'bg-accent/20 text-accent' : 'text-muted hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Style Tab */}
            {activeTab === 'style' && (
              <div className="glass rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-sm">QR Style</h3>

                {/* URL */}
                <div>
                  <label className="text-xs text-muted mb-1.5 block">Target URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={mockProject.url}
                      readOnly
                      className="flex-1 px-3 py-2 rounded-lg bg-background border border-white/5 text-xs text-muted font-mono"
                    />
                    <a href={mockProject.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg glass hover:bg-white/[0.04]" title="Open URL">
                      <ExternalLink className="w-3.5 h-3.5 text-muted" />
                    </a>
                  </div>
                </div>

                {/* Module Style */}
                <div>
                  <label className="text-xs text-muted mb-1.5 block flex items-center gap-1.5">
                    <Square className="w-3 h-3" /> Module Style
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'square' as const, label: 'Square', icon: Square },
                      { value: 'rounded' as const, label: 'Rounded', icon: Square },
                      { value: 'dot' as const, label: 'Dot', icon: Circle },
                      { value: 'soft-pixel' as const, label: 'Soft', icon: Layers },
                    ].map((style) => (
                      <button
                        type="button"
                        key={style.value}
                        onClick={() => setModuleStyle(style.value)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                          moduleStyle === style.value
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-white/5 text-muted hover:text-foreground hover:border-white/10'
                        }`}
                      >
                        <style.icon className="w-4 h-4" />
                        <span className="text-[10px]">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corner Style */}
                <div>
                  <label className="text-xs text-muted mb-1.5 block">Corner Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'square' as const, label: 'Square' },
                      { value: 'rounded' as const, label: 'Rounded' },
                      { value: 'extra-rounded' as const, label: 'Extra Round' },
                    ].map((style) => (
                      <button
                        type="button"
                        key={style.value}
                        onClick={() => setCornerStyle(style.value)}
                        className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                          cornerStyle === style.value
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-white/5 text-muted hover:text-foreground'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quiet Zone */}
                <div>
                  <label className="text-xs text-muted mb-1.5 block flex items-center gap-1.5">
                    <Maximize className="w-3 h-3" /> Quiet Zone: {quietZone} modules
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={quietZone}
                    onChange={(e) => setQuietZone(parseInt(e.target.value))}
                    className="w-full accent-accent"
                    title="Quiet zone size"
                  />
                </div>
              </div>
            )}

            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="glass rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-sm">Colors</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted mb-1 block">Foreground</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)}
                        className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" title="Foreground color" />
                      <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded bg-background border border-white/5 text-xs font-mono" placeholder="#000000" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted mb-1 block">Background</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" title="Background color" />
                      <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded bg-background border border-white/5 text-xs font-mono" placeholder="#FFFFFF" />
                    </div>
                  </div>
                </div>

                {/* Quick color presets */}
                <div>
                  <label className="text-[10px] text-muted mb-2 block">Quick Presets</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Classic', fg: '#000000', bg: '#FFFFFF' },
                      { label: 'Navy Gold', fg: '#d4af37', bg: '#1a1a2e' },
                      { label: 'Green', fg: '#1DB954', bg: '#FFFFFF' },
                      { label: 'Purple', fg: '#6c63ff', bg: '#FFFFFF' },
                      { label: 'Neon', fg: '#00fff5', bg: '#0d0221' },
                      { label: 'Coral', fg: '#E07856', bg: '#FFFFFF' },
                    ].map((preset) => (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => { setFgColor(preset.fg); setBgColor(preset.bg) }}
                        className="flex items-center gap-2 p-2 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex gap-0.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.fg }} />
                          <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: preset.bg }} />
                        </div>
                        <span className="text-[10px] text-muted">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contrast Enhancer */}
                <ContrastEnhancer
                  fgColor={fgColor}
                  bgColor={bgColor}
                  onFgChange={setFgColor}
                  onBgChange={setBgColor}
                />

                {/* Logo */}
                <div>
                  <label className="text-xs text-muted mb-1.5 block flex items-center gap-1.5">
                    <Image className="w-3 h-3" /> Logo
                  </label>
                  {logoUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-white/5 border border-white/5" />
                      <div className="flex-1">
                        <input
                          type="range"
                          min={10}
                          max={30}
                          value={logoSize}
                          onChange={(e) => setLogoSize(parseInt(e.target.value))}
                          className="w-full accent-accent"
                          title="Logo size"
                        />
                        <div className="flex justify-between text-[10px] text-muted mt-0.5">
                          <span>Size: {logoSize}%</span>
                          <button type="button" onClick={() => setLogoUrl(undefined)} className="text-red-400 hover:text-red-300">Remove</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-white/10 hover:border-accent/30 cursor-pointer transition-colors text-xs text-muted">
                      <Image className="w-4 h-4" />
                      Upload logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (ev) => setLogoUrl(ev.target?.result as string)
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Frame Tab */}
            {activeTab === 'frame' && (
              <div className="glass rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-sm">Frame & CTA</h3>

                {/* CTA Text */}
                <div>
                  <label className="text-xs text-muted mb-1.5 block flex items-center gap-1.5">
                    <Type className="w-3 h-3" /> CTA Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Scan Me"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-white/5 text-sm focus:outline-none focus:border-accent/30"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['Scan Me', 'Join Us', 'Open Menu', 'Listen Now', 'Watch Now', 'Learn More'].map((cta) => (
                      <button
                        type="button"
                        key={cta}
                        onClick={() => setCtaText(cta)}
                        className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                          ctaText === cta ? 'bg-accent/20 text-accent' : 'bg-panel text-muted hover:text-foreground'
                        }`}
                      >
                        {cta}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Style */}
                <div>
                  <label className="text-xs text-muted mb-1.5 block">Frame Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'none' as const, label: 'None' },
                      { value: 'simple' as const, label: 'Simple' },
                      { value: 'rounded' as const, label: 'Rounded' },
                    ].map((style) => (
                      <button
                        type="button"
                        key={style.value}
                        onClick={() => setFrameStyle(style.value)}
                        className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                          frameStyle === style.value
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-white/5 text-muted hover:text-foreground'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Export Tab */}
            {activeTab === 'export' && (
              <div className="glass rounded-xl p-5">
                <ExportPanel onExport={handleExport} />
              </div>
            )}

            {/* Project Info */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-3">Project Info</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Type</span>
                  <span className="capitalize">{mockProject.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Category</span>
                  <span className="capitalize">{mockProject.category}</span>
                </div>
                {mockProject.type === 'dynamic' && (
                  <div className="flex justify-between">
                    <span className="text-muted">Short URL</span>
                    <span className="font-mono">/q/{mockProject.shortId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted">Created</span>
                  <span>{formatDate(mockProject.created)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Updated</span>
                  <span>{formatDate(mockProject.updated)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
