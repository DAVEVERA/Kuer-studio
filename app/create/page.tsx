'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  Share2,
  Play,
  Glasses,
  Headphones,
  UtensilsCrossed,
  CreditCard,
  Calendar,
  Package,
  Megaphone,
  Sparkles,
  QrCode,
  Loader2,
  Image as ImageIcon,
  Layers,
  Download,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { ImageUploadPanel } from '@/components/qr/ImageUploadPanel'
import { UploadedImageAnalyzer } from '@/components/qr/UploadedImageAnalyzer'
import { BespokeFormFactorSelector, getModuleStyleForFormFactor, type FormFactor } from '@/components/qr/BespokeFormFactorSelector'
import { QrCodeRenderer } from '@/components/qr/QrCodeRenderer'
import { AutoRepairPanel, type RepairAction } from '@/components/qr/AutoRepairPanel'
import { ValidationBadge } from '@/components/qr/ValidationBadge'
import { PhoneQrPreview } from '@/components/qr/PhonePreview'
import { BrandKitSelector } from '@/components/qr/BrandKitSelector'
import { isValidUrl, normalizeUrl, getEncodableUrl } from '@/lib/utils'
import { analyzeImage, type ImageAnalysis } from '@/services/imageAnalysisService'
import { generateImageQr, type ImageQrMode, type ImageQrResult } from '@/services/imageToQrService'
import { generateImmersiveQrVariant } from '@/services/immersiveQrPipelineService'
import { generateQr } from '@/services/qrGenerator'
import { getQrMatrix } from '@/lib/qr/createQr'
import { renderStyledQr } from '@/lib/qr/qrStyles'
import { validateDataUrl, validateQrImageOnCanvas } from '@/lib/validation/validateQrImage'
import { createProject, createVariant, fetchBrandKits } from '@/lib/db/queries'
import { createClient } from '@/lib/supabase/client'
import { useGenerationPipeline, type GeneratedVariant as StreamedVariant } from '@/hooks/useGenerationPipeline'
import { QrModeSelector } from '@/components/qr/QrModeSelector'
import type { QrModeId } from '@/types/qrModes'
import type { QrType, DestinationType, StylePresetId, AiModelId, ValidationReport } from '@/types/qr'
import type { BrandKit } from '@/types/brand'

const AI_MODELS: { id: AiModelId; name: string; desc: string; icon: React.ElementType }[] = [
  { id: 'qr-monster-v2', name: 'QR Monster V2', desc: 'Best QR art quality — trained to preserve scanability', icon: Sparkles },
  { id: 'sd-controlnet', name: 'SD ControlNet', desc: 'Stable Diffusion with QR ControlNet conditioning', icon: Layers },
  { id: 'flux-dev', name: 'FLUX.1 Dev', desc: 'High-quality FLUX generation (requires FLUX model)', icon: Sparkles },
  { id: 'local', name: 'Local Renderer', desc: 'Fast deterministic variants without an AI provider', icon: QrCode },
]

const STEPS = [
  { id: 'url', label: 'Enter URL' },
  { id: 'type', label: 'QR Type' },
  { id: 'image', label: 'Upload Image' },
  { id: 'style', label: 'Style & Form' },
  { id: 'generate', label: 'Generate' },
  { id: 'results', label: 'Results' },
]

const DESTINATION_ICONS: Record<string, React.ElementType> = {
  'website': Globe, 'social-media': Share2, 'video': Play, 'ar-experience': Glasses,
  'podcast': Headphones, 'menu': UtensilsCrossed, 'payment': CreditCard,
  'event': Calendar, 'product-packaging': Package, 'campaign': Megaphone,
}

const DESTINATIONS: { value: DestinationType; label: string }[] = [
  { value: 'website', label: 'Website' }, { value: 'social-media', label: 'Social Media' },
  { value: 'video', label: 'Video' }, { value: 'ar-experience', label: 'AR Experience' },
  { value: 'podcast', label: 'Podcast' }, { value: 'menu', label: 'Menu' },
  { value: 'payment', label: 'Payment' }, { value: 'event', label: 'Event' },
  { value: 'product-packaging', label: 'Product Packaging' }, { value: 'campaign', label: 'Campaign' },
]

const STYLE_PRESETS: { id: StylePresetId; name: string; colors: string[]; desc: string }[] = [
  { id: 'premium-luxury', name: 'Premium Luxury', colors: ['#1a1a2e', '#d4af37', '#0f0f1a'], desc: 'Gold linework, deep navy' },
  { id: 'organic-nature', name: 'Organic Nature', colors: ['#2d5016', '#8fbc5a', '#f4f1de'], desc: 'Botanical textures' },
  { id: 'tech-circuitboard', name: 'Tech Circuitboard', colors: ['#0a192f', '#64ffda', '#e63946'], desc: 'Metallic traces' },
  { id: 'podcast-artwork', name: 'Podcast Artwork', colors: ['#6c63ff', '#ff6584', '#2d2d2d'], desc: 'Bold audio vibes' },
  { id: 'minimal-editorial', name: 'Minimal Editorial', colors: ['#fafafa', '#333333', '#e0e0e0'], desc: 'Clean Swiss design' },
  { id: 'cyberpunk-neon', name: 'Cyberpunk Neon', colors: ['#0d0221', '#ff2975', '#00fff5'], desc: 'Glowing neon cyber' },
  { id: 'soft-community', name: 'Soft Community', colors: ['#fef3e2', '#f4845f', '#7b2d8e'], desc: 'Warm inclusive tones' },
  { id: 'restaurant-menu', name: 'Restaurant Menu', colors: ['#2c1810', '#d4a574', '#f5f0eb'], desc: 'Culinary elegance' },
  { id: 'event-poster', name: 'Event Poster', colors: ['#1a0533', '#ff6b35', '#ffd700'], desc: 'Dynamic event energy' },
  { id: 'product-packaging', name: 'Product Packaging', colors: ['#f8f4ef', '#2d3436', '#e17055'], desc: 'Clean shelf-ready' },
  { id: 'corporate-clean', name: 'Corporate Clean', colors: ['#ffffff', '#1e3a5f', '#4a90d9'], desc: 'Professional trust' },
  { id: 'dark-futuristic', name: 'Dark Futuristic', colors: ['#0a0a0a', '#00d4ff', '#1a1a2e'], desc: 'Sci-fi HUD panels' },
]

interface GeneratedVariant {
  id: string
  name: string
  dataUrl: string
  canvas: HTMLCanvasElement | null
  score: number
  report: ValidationReport | null
  mode: 'standard' | ImageQrMode | 'ai-controlnet'
}

export default function CreatePage() {
  const [step, setStep] = useState(0)
  const [projectName, setProjectName] = useState('')
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [destination, setDestination] = useState<DestinationType | ''>('')
  const [qrType, setQrType] = useState<QrType>('static')

  // Image upload
  const [uploadedImage, setUploadedImage] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [imageMode, setImageMode] = useState<ImageQrMode>('qr-into-image')

  // Style
  const [selectedStyle, setSelectedStyle] = useState<StylePresetId | ''>('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [formFactor, setFormFactor] = useState<FormFactor>('rounded-qr')
  const [useAiPipeline, setUseAiPipeline] = useState(true)
  const [selectedModel, setSelectedModel] = useState<AiModelId>('qr-monster-v2')
  const [selectedMode, setSelectedMode] = useState<QrModeId | null>(null)
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)

  // Generation
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationNotice, setGenerationNotice] = useState('')
  const [variants, setVariants] = useState<GeneratedVariant[]>([])
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [variantCount, setVariantCount] = useState(4)
  const [brandKits, setBrandKits] = useState<BrandKit[]>([])
  const [selectedBrandKitId, setSelectedBrandKitId] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)
  const [savedProjectId, setSavedProjectId] = useState('')
  const [isRepairing, setIsRepairing] = useState(false)

  // Streaming generation hook
  const pipeline = useGenerationPipeline()

  useEffect(() => {
    fetchBrandKits().then(setBrandKits).catch(() => setBrandKits([]))
  }, [])

  const handleImageSelect = useCallback(async (file: File, dataUrl: string) => {
    setUploadedFile(file)
    setUploadedImage(dataUrl)
    setIsAnalyzing(true)
    try {
      const analysis = await analyzeImage(dataUrl)
      setImageAnalysis(analysis)
    } catch {
      setImageAnalysis(null)
    }
    setIsAnalyzing(false)
  }, [])

  const handleImageClear = useCallback(() => {
    setUploadedImage('')
    setUploadedFile(null)
    setImageAnalysis(null)
  }, [])

  const canProceed = useCallback(() => {
    switch (step) {
      case 0: return projectName.trim().length > 0 && url.length > 0 && isValidUrl(url)
      case 1: return true
      case 2: return true // image upload is optional
      case 3: return (selectedMode !== null || selectedStyle !== '' || customPrompt.length > 0) || uploadedImage
      case 4: return !isGenerating
      default: return true
    }
  }, [step, url, selectedMode, selectedStyle, customPrompt, isGenerating, uploadedImage])

  const handleNext = () => {
    if (step === 0 && !isValidUrl(url)) {
      setUrlError('Voer een geldig webadres in (bijv. example.com)')
      return
    }
    setUrlError('')

    if (step === 4 && !isGenerating) {
      handleGenerate()
      return
    }

    if (step < STEPS.length - 1) setStep(step + 1)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationNotice('')
    setVariants([])

    const { moduleStyle, cornerStyle } = getModuleStyleForFormFactor(formFactor)
    const styleColors = selectedStyle ? STYLE_PRESETS.find(s => s.id === selectedStyle)?.colors : undefined
    const fgColor = imageAnalysis?.suggestedQrFgColor ?? (styleColors?.[0] || '#000000')
    const bgColor = imageAnalysis?.suggestedQrBgColor ?? '#FFFFFF'

    const generatedVariants: GeneratedVariant[] = []

    // AI streaming pipeline (QR Monster, FLUX, SD ControlNet)
    if (useAiPipeline && selectedModel !== 'local' && (selectedStyle || customPrompt)) {
      try {
        const aiStylePreset = selectedStyle || 'corporate-clean'

        await pipeline.generate({
          targetUrl: getEncodableUrl(url),
          stylePreset: aiStylePreset,
          model: selectedModel,
          customPrompt: customPrompt || undefined,
          brandColors: styleColors,
          outputSize: 1024,
          variantCount,
          useAiPrompt: Boolean(customPrompt),
        })

        // Pipeline results are handled via the hook's state
        // Move to results once pipeline completes
        setIsGenerating(false)
        setStep(5)
        return
      } catch (error) {
        setGenerationNotice(
          error instanceof Error
            ? `${error.message}. Using local renderer instead.`
            : 'AI pipeline unavailable. Using local renderer instead.'
        )
      }
    }

    // Fallback: Image-based variants
    if (generatedVariants.length === 0 && uploadedImage && imageAnalysis) {
      const alternateMode: ImageQrMode = imageMode === 'qr-into-image' ? 'image-as-style' : 'qr-into-image'
      const modes: ImageQrMode[] = [imageMode, imageMode, alternateMode, alternateMode]
      const variantNames = [
        imageMode === 'qr-into-image' ? 'QR Integrated' : 'Image as Style',
        imageMode === 'qr-into-image' ? 'QR Integrated (Alt)' : 'Image as Style (Alt)',
        alternateMode === 'qr-into-image' ? 'QR Integrated' : 'Image as Style',
        alternateMode === 'qr-into-image' ? 'QR Integrated (Alt)' : 'Image as Style (Alt)',
      ]

      for (let i = 0; i < 4; i++) {
        setGenerationProgress(Math.round(((i + 1) / 4) * 90))
        const mode = modes[i % 2]
        try {
          const result = await generateImageQr({
            mode,
            targetUrl: getEncodableUrl(url),
            imageDataUrl: uploadedImage,
            analysis: imageAnalysis,
            fgColor: i >= 2 ? (fgColor === '#000000' ? '#1a1a2e' : '#f0f0f0') : fgColor,
            moduleStyle,
            cornerStyle,
            errorCorrection: 'H',
            qrOpacity: i >= 2 ? 0.9 : 0.85,
            qrSize: i >= 2 ? 0.3 : 0.35,
            outputSize: 1024,
          })

          let report: ValidationReport | null = null
          let score = 0
          try {
            report = await validateQrImageOnCanvas(result.canvas, getEncodableUrl(url))
            score = report.score
          } catch {
            score = 0
          }

          generatedVariants.push({
            id: `var-${i}`,
            name: variantNames[i],
            dataUrl: result.dataUrl,
            canvas: result.canvas,
            score,
            report,
            mode,
          })
        } catch {
          generatedVariants.push({
            id: `var-${i}`,
            name: variantNames[i],
            dataUrl: '',
            canvas: null,
            score: 0,
            report: null,
            mode,
          })
        }
      }
    } else if (generatedVariants.length === 0) {
      // Fallback: Local canvas-rendered QR variants
      const moduleStyles: Array<'square' | 'rounded' | 'dot' | 'soft-pixel'> = [moduleStyle, 'rounded', 'dot', 'soft-pixel']
      const cornerStyles: Array<'square' | 'rounded' | 'extra-rounded'> = [cornerStyle, 'rounded', 'extra-rounded', 'square']
      const styleVariations = [
        { fg: styleColors?.[0] || fgColor, bg: bgColor },
        { fg: styleColors?.[1] || '#333333', bg: '#FFFFFF' },
        { fg: styleColors?.[0] || '#1a1a2e', bg: styleColors?.[2] || '#f5f1de' },
        { fg: '#000000', bg: '#FFFFFF' },
      ]

      const { matrix, size: qrSize } = await getQrMatrix(getEncodableUrl(url), 'H')

      for (let i = 0; i < 4; i++) {
        setGenerationProgress(Math.round(((i + 1) / 4) * 90))

        const variation = styleVariations[i]
        const canvasSize = 1024
        const margin = 40
        const mSize = (canvasSize - margin * 2) / qrSize

        try {
          const canvas = document.createElement('canvas')
          canvas.width = canvasSize
          canvas.height = canvasSize
          const ctx = canvas.getContext('2d')!

          renderStyledQr(
            ctx,
            matrix,
            mSize,
            margin,
            moduleStyles[i] || moduleStyle,
            cornerStyles[i] || cornerStyle,
            variation.fg,
            variation.bg
          )

          const dataUrl = canvas.toDataURL('image/png')

          let report: ValidationReport | null = null
          let score = 0
          try {
            report = await validateQrImageOnCanvas(canvas, getEncodableUrl(url))
            score = report.score
          } catch {
            score = 0
          }

          generatedVariants.push({
            id: `var-${i}`,
            name: `Variant ${String.fromCharCode(65 + i)}`,
            dataUrl,
            canvas,
            score,
            report,
            mode: 'standard',
          })
        } catch {
          generatedVariants.push({
            id: `var-${i}`,
            name: `Variant ${String.fromCharCode(65 + i)}`,
            dataUrl: '',
            canvas: null,
            score: 0,
            report: null,
            mode: 'standard',
          })
        }
      }
    }

    setGenerationProgress(100)
    await new Promise(r => setTimeout(r, 300))
    setVariants(generatedVariants)
    setIsGenerating(false)
    setStep(5)
  }

  const handleSaveProject = async () => {
    if (isSaving || savedProjectId) return
    setIsSaving(true)
    setGenerationNotice('')

    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) throw new Error('Your session has expired. Please log in again.')

      const project = await createProject({
        user_id: authData.user.id,
        brand_kit_id: selectedBrandKitId,
        name: projectName.trim(),
        target_url: normalizeUrl(url),
        type: qrType,
        category: destination || 'website',
      })

      const selected = pipeline.variants.length > 0
        ? pipeline.variants[selectedVariant]
        : variants[selectedVariant]

      if (selected) {
        const dataUrl = 'imageDataUrl' in selected ? selected.imageDataUrl : selected.dataUrl
        if (!dataUrl) throw new Error('The selected variant has no exportable image.')
        const blob = await fetch(dataUrl).then((response) => response.blob())
        const assetForm = new FormData()
        assetForm.set('file', new File([blob], 'qr-variant.png', { type: 'image/png' }))
        assetForm.set('projectId', project.id)
        const assetResponse = await fetch('/api/assets/qr', { method: 'POST', body: assetForm })
        const publicAsset = await assetResponse.json()
        if (!assetResponse.ok || !publicAsset.publicUrl) throw new Error(publicAsset.error || 'Could not store QR asset.')

        const report = selected.report ?? {
          isScannable: false,
          decodedUrl: null,
          urlMatches: false,
          score: 0,
          checks: { contrast: 'warning' as const, quietZone: 'warning' as const, finderPatterns: 'warning' as const, resolution: 'warning' as const },
          recommendations: ['Run scan validation before production distribution.'],
        }

        await createVariant({
          project_id: project.id,
          prompt: customPrompt,
          style_preset: selectedStyle || 'corporate-clean',
          model_id: selectedModel,
          image_url: publicAsset.publicUrl,
          base_qr_url: qrType === 'dynamic' ? `/q/${project.short_id}` : normalizeUrl(url),
          scanability_score: report.score,
          validation_status: report.isScannable ? 'validated' : 'pending',
          validation_report: report,
          export_urls: {},
        })
      }

      setSavedProjectId(project.id)
      setGenerationNotice('Project and selected variant saved to your account.')
    } catch (error) {
      setGenerationNotice(error instanceof Error ? error.message : 'Could not save this project.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRepair = async (action: RepairAction) => {
    if (action === 'regenerate-variant') {
      pipeline.reset()
      setStep(4)
      return
    }

    setIsRepairing(true)
    setGenerationNotice('')
    try {
      const targetUrl = getEncodableUrl(url)
      const generated = await generateQr(targetUrl, {
        targetUrl,
        fgColor: '#000000',
        bgColor: '#FFFFFF',
        brandColors: [],
        logoSize: action === 'reduce-overlay' ? 10 : 0,
        quietZone: action === 'add-quiet-zone' ? 8 : 4,
        ctaText: '',
        frameStyle: 'none',
        cornerStyle: action === 'restore-finder-patterns' || action === 'rebuild-modules' ? 'square' : 'rounded',
        moduleStyle: action === 'simplify-artwork' || action === 'rebuild-modules' ? 'square' : 'rounded',
        errorCorrection: 'H',
      })
      const report = await validateDataUrl(generated.dataUrl, targetUrl)
      pipeline.reset()
      setVariants([{
        id: `repair-${Date.now()}`,
        name: 'Repaired Variant',
        dataUrl: generated.dataUrl,
        canvas: null,
        score: report.score,
        report,
        mode: 'standard',
      }])
      setSelectedVariant(0)
      setGenerationNotice(`Repair applied and revalidated at ${report.score}/100.`)
    } catch (error) {
      setGenerationNotice(error instanceof Error ? error.message : 'Could not repair this variant.')
    } finally {
      setIsRepairing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 80) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/10'
    if (score >= 80) return 'bg-yellow-500/10'
    return 'bg-red-500/10'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Usable'
    return 'Needs Work'
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === step
                    ? 'bg-accent/20 text-accent'
                    : i < step
                    ? 'bg-green-500/10 text-green-400 cursor-pointer hover:bg-green-500/20'
                    : 'bg-panel text-muted'
                }`}
              >
                {i < step ? <Check className="w-3 h-3" /> : <span className="w-4 text-center">{i + 1}</span>}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px flex-shrink-0 ${i < step ? 'bg-green-400/30' : 'bg-white/5'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 0: URL Input */}
            {step === 0 && (
              <div className="glass rounded-2xl p-8 md:p-12">
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-7 h-7 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Enter your URL</h2>
                  <p className="text-muted">Paste the URL you want to encode in your branded QR code</p>
                </div>
                <div className="max-w-xl mx-auto">
                  <label className="block text-sm font-medium mb-2" htmlFor="project-name">Project name</label>
                  <input
                    id="project-name"
                    type="text"
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="Campaign name"
                    maxLength={160}
                    className="w-full px-4 py-3 mb-5 bg-background border border-white/10 text-foreground"
                    autoFocus
                  />
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40 text-lg select-none pointer-events-none">
                      {!url && 'https://'}
                    </span>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => { setUrl(e.target.value); setUrlError('') }}
                      placeholder="example.com"
                      className="w-full px-4 py-3.5 rounded-xl bg-background border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 text-lg"
                    />
                  </div>
                  {urlError && <p className="text-red-400 text-sm mt-2">{urlError}</p>}
                  {url && isValidUrl(url) && (
                    <p className="text-xs text-green-400/70 mt-2 font-mono">{normalizeUrl(url)}</p>
                  )}
                  <p className="text-xs text-muted mt-2">Typ gewoon je domeinnaam — https:// wordt automatisch toegevoegd.</p>

                  {/* Destination type selection */}
                  <div className="mt-8">
                    <h3 className="text-sm font-medium mb-3">Destination type <span className="text-muted font-normal">(optional)</span></h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {DESTINATIONS.map((dest) => {
                        const Icon = DESTINATION_ICONS[dest.value] || Globe
                        return (
                          <button
                            key={dest.value}
                            onClick={() => setDestination(dest.value === destination ? '' : dest.value)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                              destination === dest.value
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-white/5 bg-panel/50 hover:bg-white/[0.04] text-muted hover:text-foreground'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px] font-medium text-center">{dest.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: QR Type */}
            {step === 1 && (
              <div className="glass rounded-2xl p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Choose QR type</h2>
                  <p className="text-muted">Static encodes the URL directly. Dynamic enables tracking and URL changes.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <button
                    onClick={() => setQrType('static')}
                    className={`p-6 rounded-xl border text-left transition-all ${
                      qrType === 'static' ? 'border-accent bg-accent/10' : 'border-white/5 bg-panel/50 hover:bg-white/[0.04]'
                    }`}
                  >
                    <QrCode className={`w-8 h-8 mb-3 ${qrType === 'static' ? 'text-accent' : 'text-muted'}`} />
                    <h3 className="font-semibold mb-1">Static QR</h3>
                    <p className="text-sm text-muted">URL encoded directly in the QR pattern. No tracking. Works offline.</p>
                  </button>
                  <button
                    onClick={() => setQrType('dynamic')}
                    className={`p-6 rounded-xl border text-left transition-all ${
                      qrType === 'dynamic' ? 'border-accent bg-accent/10' : 'border-white/5 bg-panel/50 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Sparkles className={`w-8 h-8 mb-3 ${qrType === 'dynamic' ? 'text-accent' : 'text-muted'}`} />
                    <h3 className="font-semibold mb-1">Dynamic QR</h3>
                    <p className="text-sm text-muted">Redirects via short URL. Enables scan tracking, analytics, and URL updates.</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Image Upload */}
            {step === 2 && (
              <div className="glass rounded-2xl p-8 md:p-12">
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-7 h-7 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Upload your image</h2>
                  <p className="text-muted">Upload artwork, a logo, product photo, or brand asset to create a bespoke QR design</p>
                  <p className="text-xs text-muted/60 mt-1">This step is optional — skip to use style presets only</p>
                </div>

                <div className="max-w-lg mx-auto">
                  <ImageUploadPanel
                    onImageSelect={handleImageSelect}
                    onClear={handleImageClear}
                    imageDataUrl={uploadedImage}
                  />

                  {isAnalyzing && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted">
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      Analyzing image colors, contrast, and safe zones...
                    </div>
                  )}

                  {imageAnalysis && !isAnalyzing && (
                    <>
                      <UploadedImageAnalyzer analysis={imageAnalysis} className="mt-4" />

                      {/* Image mode selection */}
                      <div className="mt-4 glass rounded-xl p-4">
                        <h4 className="text-xs font-medium mb-2">QR Integration Mode</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setImageMode('qr-into-image')}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              imageMode === 'qr-into-image' ? 'border-accent bg-accent/10' : 'border-white/5 hover:border-white/10'
                            }`}
                          >
                            <Layers className={`w-5 h-5 mb-1.5 ${imageMode === 'qr-into-image' ? 'text-accent' : 'text-muted'}`} />
                            <h5 className="text-xs font-semibold">QR into Image</h5>
                            <p className="text-[10px] text-muted mt-0.5">QR embedded in a detected safe area</p>
                          </button>
                          <button
                            onClick={() => setImageMode('image-as-style')}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              imageMode === 'image-as-style' ? 'border-accent bg-accent/10' : 'border-white/5 hover:border-white/10'
                            }`}
                          >
                            <Sparkles className={`w-5 h-5 mb-1.5 ${imageMode === 'image-as-style' ? 'text-accent' : 'text-muted'}`} />
                            <h5 className="text-xs font-semibold">Image as QR Style</h5>
                            <p className="text-[10px] text-muted mt-0.5">Image becomes the QR visual texture</p>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Style & Form Factor */}
            {step === 3 && (
              <div className="glass rounded-2xl p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Choose style & form factor</h2>
                  <p className="text-muted">
                    {uploadedImage
                      ? 'Select a form factor for your image-based QR code'
                      : 'Select a style preset or describe your own custom style'}
                  </p>
                </div>

                {/* Brand Kit Selector */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Brand Kit <span className="text-muted font-normal">(optional)</span></h3>
                  <BrandKitSelector
                    brandKits={brandKits}
                    selectedId={selectedBrandKitId}
                    onSelect={setSelectedBrandKitId}
                  />
                </div>

                {/* Form Factor Selector */}
                <div className="mb-8">
                  <h3 className="text-sm font-medium mb-3">QR Form Factor</h3>
                  <BespokeFormFactorSelector value={formFactor} onChange={setFormFactor} />
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-medium mb-3">AI Model</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {AI_MODELS.map((model) => {
                      const Icon = model.icon
                      const isSelected = selectedModel === model.id
                      const isLocal = model.id === 'local'
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(model.id)
                            setUseAiPipeline(!isLocal)
                          }}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            isSelected ? 'border-accent bg-accent/10' : 'border-white/5 bg-panel/50 hover:bg-white/[0.04]'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-accent' : 'text-muted'}`} />
                          <h4 className="text-sm font-semibold">{model.name}</h4>
                          <p className="text-[11px] text-muted mt-1">{model.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                  {/* Variant count selector */}
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs text-muted">Variants:</span>
                    {[4, 6, 8].map(count => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setVariantCount(count)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          variantCount === count ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-panel border border-white/5 text-muted hover:text-foreground'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* QR Art Mode Selector */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">QR Art Mode</h3>
                  <QrModeSelector
                    selectedMode={selectedMode}
                    selectedVariation={selectedVariation}
                    onModeSelect={(modeId) => {
                      setSelectedMode(modeId)
                      setSelectedVariation(null)
                      setSelectedStyle('')
                    }}
                    onVariationSelect={setSelectedVariation}
                  />
                </div>

                {/* Classic Style Presets (fallback / additional) */}
                <div>
                  <h3 className="text-sm font-medium mb-3">
                    {selectedMode ? 'Additional Style Override' : 'Style Preset'}
                    {selectedMode && <span className="text-muted font-normal ml-1">(optional)</span>}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                    {STYLE_PRESETS.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => { setSelectedStyle(style.id === selectedStyle ? '' : style.id); setCustomPrompt('') }}
                        className={`rounded-xl border overflow-hidden transition-all ${
                          selectedStyle === style.id
                            ? 'border-accent ring-1 ring-accent/30'
                            : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div
                          className="h-16"
                          style={{ background: `linear-gradient(135deg, ${style.colors[0]}, ${style.colors[1]}, ${style.colors[2]})` }}
                        />
                        <div className="p-2.5 bg-panel/80">
                          <h4 className="text-xs font-semibold truncate">{style.name}</h4>
                          <p className="text-[10px] text-muted truncate">{style.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center text-xs text-muted mb-3">— or describe a custom style —</div>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => { setCustomPrompt(e.target.value); setSelectedStyle('') }}
                      placeholder="Describe your desired QR style... e.g., 'A watercolor botanical design with soft pastel greens and warm light'"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Live QR Preview */}
                {url && isValidUrl(url) && (
                  <div className="mt-8 flex justify-center">
                    <div className="glass rounded-xl p-6">
                      <h4 className="text-xs text-muted text-center mb-3">Live Preview</h4>
                      <QrCodeRenderer
                        url={getEncodableUrl(url)}
                        size={200}
                        fgColor={selectedStyle ? STYLE_PRESETS.find(s => s.id === selectedStyle)?.colors[0] : '#000000'}
                        bgColor="#FFFFFF"
                        moduleStyle={getModuleStyleForFormFactor(formFactor).moduleStyle}
                        cornerStyle={getModuleStyleForFormFactor(formFactor).cornerStyle}
                        errorCorrection="H"
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Generate */}
            {step === 4 && (
              <div className="glass rounded-2xl p-8 md:p-12">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Ready to generate</h2>
                  <p className="text-muted mb-8">
                    {uploadedImage
                      ? 'We\'ll create 4 bespoke QR variants from your uploaded image'
                      : 'We\'ll create 4 styled variants of your branded QR code'}
                  </p>

                  {/* Summary */}
                  <div className="max-w-md mx-auto glass rounded-xl p-6 mb-8 text-left space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">URL</span>
                      <span className="font-mono text-xs truncate ml-4 max-w-[200px]">{normalizeUrl(url)}</span>
                    </div>
                    {destination && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Destination</span>
                        <span className="capitalize">{destination.replace('-', ' ')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Type</span>
                      <span className="capitalize">{qrType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">AI Model</span>
                      <span>{AI_MODELS.find(m => m.id === selectedModel)?.name ?? 'Local Renderer'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Variants</span>
                      <span>{variantCount}</span>
                    </div>
                    {uploadedImage && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Image Mode</span>
                        <span>{imageMode === 'qr-into-image' ? 'QR into Image' : 'Image as Style'}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Form Factor</span>
                      <span className="capitalize">{formFactor.replace(/-/g, ' ')}</span>
                    </div>
                    {selectedMode && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">QR Mode</span>
                        <span className="capitalize">{selectedMode.replace(/-/g, ' ')}</span>
                      </div>
                    )}
                    {selectedStyle && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Style</span>
                        <span>{STYLE_PRESETS.find(s => s.id === selectedStyle)?.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Error Correction</span>
                      <span>Level H (30%)</span>
                    </div>
                  </div>

                  {(isGenerating || pipeline.isGenerating) && (
                    <div className="max-w-md mx-auto mb-4">
                      <div className="flex items-center justify-between text-sm text-muted mb-2">
                        <span>Generating variants...</span>
                        <span>
                          {pipeline.isGenerating
                            ? `${pipeline.progress.completed}/${pipeline.progress.total}`
                            : `${generationProgress}%`}
                        </span>
                      </div>
                      <div className="h-2 bg-panel rounded-full overflow-hidden">
                        <motion.div
                          className="h-full gradient-accent rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: pipeline.isGenerating
                              ? `${pipeline.progress.total > 0 ? (pipeline.progress.completed / pipeline.progress.total) * 100 : 0}%`
                              : `${generationProgress}%`
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          {pipeline.isGenerating
                            ? `Running ${AI_MODELS.find(m => m.id === selectedModel)?.name ?? 'AI'} pipeline... (${pipeline.progress.completed}/${pipeline.progress.total} complete)`
                            : generationProgress < 25 ? 'Creating base QR code...'
                            : generationProgress < 50 ? (uploadedImage ? 'Analyzing image & integrating QR...' : 'Applying style preset...')
                            : generationProgress < 75 ? 'Rendering variants...'
                            : generationProgress < 95 ? 'Validating scanability...'
                            : 'Finalizing...'}
                        </span>
                      </div>

                      {/* Show streamed variants as they arrive */}
                      {pipeline.variants.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {pipeline.variants.map((v) => (
                            <div key={v.index} className="aspect-square rounded-lg overflow-hidden bg-black/20">
                              <img src={v.imageDataUrl} alt={`Variant ${v.index + 1}`} className="w-full h-full object-contain" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {generationNotice && (
                    <p className="max-w-md mx-auto text-xs text-yellow-400/80">{generationNotice}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Results */}
            {step === 5 && (() => {
              // Use pipeline variants if available, otherwise use local variants
              const displayVariants = pipeline.variants.length > 0
                ? pipeline.variants.map((v) => ({
                    id: `ai-var-${v.index}`,
                    name: `${v.model ? AI_MODELS.find(m => m.id === v.model)?.name ?? 'AI' : 'AI'} ${String.fromCharCode(65 + v.index)}`,
                    dataUrl: v.imageDataUrl,
                    canvas: null as HTMLCanvasElement | null,
                    score: v.score,
                    report: v.report,
                    mode: 'ai-controlnet' as const,
                  }))
                : variants

              return (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Your Branded QR Variants</h2>
                  <p className="text-muted">
                    {pipeline.variants.length > 0
                      ? `Generated ${pipeline.variants.length} variants with ${AI_MODELS.find(m => m.id === selectedModel)?.name ?? 'AI'}. Select one to export.`
                      : uploadedImage
                        ? 'Each variant integrates your uploaded image with a scannable QR code.'
                        : 'Each variant has been generated with your selected style. Select one to edit or export.'}
                  </p>
                </div>

                <div className="grid lg:grid-cols-[1fr,280px] gap-6">
                {/* Variants grid + phone preview */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {displayVariants.map((variant, i) => (
                    <motion.div
                      key={variant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className={`glass rounded-xl overflow-hidden cursor-pointer transition-all ${
                        selectedVariant === i ? 'ring-2 ring-accent' : 'hover:bg-white/[0.04]'
                      }`}
                      onClick={() => setSelectedVariant(i)}
                    >
                      <div className="aspect-square relative overflow-hidden bg-black/20">
                        {variant.dataUrl ? (
                          <img
                            src={variant.dataUrl}
                            alt={variant.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted">
                            <AlertTriangle className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full bg-black/40 text-white/80">
                          {variant.name}
                        </div>
                        {variant.mode !== 'standard' && (
                          <div className="absolute top-3 left-3 text-[10px] font-medium px-2 py-1 rounded-full bg-accent/80 text-white">
                            {variant.mode === 'ai-controlnet'
                              ? 'ControlNet'
                              : variant.mode === 'qr-into-image'
                                ? 'Integrated'
                                : 'Styled'}
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getScoreBg(variant.score)} ${getScoreColor(variant.score)}`}>
                            {variant.score}/100
                          </span>
                          <span className="text-xs text-muted">{getScoreLabel(variant.score)}</span>
                        </div>
                        {variant.score >= 80 ? (
                          <span className="flex items-center gap-1 text-xs text-green-400">
                            <CheckCircle2 className="w-3 h-3" /> Validated
                          </span>
                        ) : (
                          <span className="text-xs text-yellow-400">Needs Improvement</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Phone Preview */}
                <div className="hidden lg:block sticky top-24">
                  <PhoneQrPreview
                    qrDataUrl={displayVariants[selectedVariant]?.dataUrl}
                    label={displayVariants[selectedVariant]?.name}
                  />
                </div>
                </div>

                {/* Validation detail for selected variant */}
                {displayVariants[selectedVariant]?.report && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-accent" />
                        Validation Report — {displayVariants[selectedVariant].name}
                      </h3>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        getScoreBg(displayVariants[selectedVariant].score)} ${getScoreColor(displayVariants[selectedVariant].score)
                      }`}>
                        Score: {displayVariants[selectedVariant].score}/100
                      </span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(displayVariants[selectedVariant].report!.checks).map(([key, status]) => {
                        const label = key === 'quietZone' ? 'Quiet Zone' :
                          key === 'finderPatterns' ? 'Finder Patterns' :
                          key.charAt(0).toUpperCase() + key.slice(1)
                        return (
                          <div key={key} className="flex items-center justify-between py-1.5">
                            <span className="text-sm text-muted">{label}</span>
                            <span className={`flex items-center gap-1.5 text-xs font-medium ${
                              status === 'pass' ? 'text-green-400' : status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {status === 'pass' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Auto Repair if needed */}
                {displayVariants[selectedVariant]?.report && displayVariants[selectedVariant].score < 90 && (
                  <AutoRepairPanel
                    report={displayVariants[selectedVariant].report!}
                    onRepair={handleRepair}
                    isRepairing={isRepairing}
                  />
                )}

                {/* Export actions */}
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveProject}
                    disabled={isSaving || Boolean(savedProjectId)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg gradient-accent text-white text-sm font-medium disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {savedProjectId ? 'Saved to Projects' : isSaving ? 'Saving...' : 'Save Project'}
                  </button>
                  {displayVariants[selectedVariant]?.dataUrl && (
                    <a
                      href={displayVariants[selectedVariant].dataUrl}
                      download={`kuer-qr-${displayVariants[selectedVariant].name.toLowerCase().replace(/\s+/g, '-')}.png`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                      Download Selected
                    </a>
                  )}
                  <button
                    onClick={() => {
                      pipeline.reset()
                      setStep(4)
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg glass text-foreground text-sm font-medium hover:bg-white/[0.04] transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate More
                  </button>
                  <Link
                    href={savedProjectId ? `/projects/${savedProjectId}` : '/projects'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg glass text-foreground text-sm font-medium hover:bg-white/[0.04] transition-colors"
                  >
                    View All Projects
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              )
            })()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="flex justify-between">
            <button
              onClick={() => step > 0 ? setStep(step - 1) : null}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                step > 0 ? 'glass text-foreground hover:bg-white/[0.04]' : 'text-transparent pointer-events-none'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === 4 ? (
                isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate 4 Variants
                  </>
                )
              ) : step === 2 && !uploadedImage ? (
                <>
                  Skip — Use Presets Only
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
