export interface BrandKit {
  id: string
  user_id: string
  name: string
  logo_url?: string
  primary_color: string
  secondary_color: string
  accent_color: string
  font_preference?: string
  created_at: string
}

export type BrandKitFormData = Omit<BrandKit, 'id' | 'user_id' | 'created_at'>
