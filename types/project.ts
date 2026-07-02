import type { QrProject, QrVariant } from './qr'
import type { BrandKit } from './brand'

export interface ProjectWithVariants extends QrProject {
  variants: QrVariant[]
  brand_kit?: BrandKit
}

export interface ProjectSummary {
  id: string
  name: string
  target_url: string
  type: QrProject['type']
  category: QrProject['category']
  variant_count: number
  best_score: number
  last_export?: string
  created_at: string
  updated_at: string
  preview_image?: string
}
