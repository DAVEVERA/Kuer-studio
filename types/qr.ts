export type AiModelId = 'flux-dev' | 'qr-monster-v2' | 'sd-controlnet' | 'local'

export type QrType = 'static' | 'dynamic'

export type DestinationType =
  | 'website'
  | 'social-media'
  | 'video'
  | 'ar-experience'
  | 'podcast'
  | 'menu'
  | 'payment'
  | 'event'
  | 'product-packaging'
  | 'campaign'

export type ValidationStatus =
  | 'validated'
  | 'needs-contrast-improvement'
  | 'quiet-zone-too-small'
  | 'finder-pattern-damaged'
  | 'low-scan-confidence'
  | 'not-scannable'
  | 'pending'

export type ModuleStyle = 'square' | 'rounded' | 'dot' | 'soft-pixel'
export type CornerStyle = 'square' | 'rounded' | 'extra-rounded'
export type FrameStyle = 'none' | 'simple' | 'rounded' | 'badge' | 'banner'

export interface QrProject {
  id: string
  user_id: string
  brand_kit_id?: string
  name: string
  target_url: string
  short_id: string
  type: QrType
  category: DestinationType
  created_at: string
  updated_at: string
}

export interface QrVariant {
  id: string
  project_id: string
  prompt: string
  style_preset: string
  model_id?: AiModelId
  image_url: string
  base_qr_url: string
  scanability_score: number
  validation_status: ValidationStatus
  validation_report: ValidationReport
  export_urls: Record<string, string>
  created_at: string
}

export interface ValidationReport {
  isScannable: boolean
  decodedUrl: string | null
  urlMatches: boolean
  score: number
  checks: {
    contrast: 'pass' | 'warning' | 'fail'
    quietZone: 'pass' | 'warning' | 'fail'
    finderPatterns: 'pass' | 'warning' | 'fail'
    resolution: 'pass' | 'warning' | 'fail'
  }
  recommendations: string[]
}

export interface QrEditorState {
  targetUrl: string
  fgColor: string
  bgColor: string
  brandColors: string[]
  logoUrl?: string
  logoSize: number
  quietZone: number
  ctaText: string
  frameStyle: FrameStyle
  cornerStyle: CornerStyle
  moduleStyle: ModuleStyle
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
}

export interface QrGenerationRequest {
  targetUrl: string
  type: QrType
  category: DestinationType
  stylePreset: string
  customPrompt?: string
  brandKitId?: string
  editorState: QrEditorState
}

export type StylePresetId =
  | 'premium-luxury'
  | 'organic-nature'
  | 'tech-circuitboard'
  | 'podcast-artwork'
  | 'minimal-editorial'
  | 'cyberpunk-neon'
  | 'soft-community'
  | 'restaurant-menu'
  | 'event-poster'
  | 'product-packaging'
  | 'corporate-clean'
  | 'dark-futuristic'

export interface StylePreset {
  id: StylePresetId
  name: string
  description: string
  prompt: string
  previewColors: string[]
  icon: string
}
