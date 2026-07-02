export type ExportFormat = 'png-1024' | 'png-2048' | 'svg' | 'pdf' | 'pdf-print' | 'social-square' | 'social-story' | 'social-landscape' | 'a4-poster' | 'transparent-png'

export interface ExportOption {
  format: ExportFormat
  label: string
  description: string
  dimensions?: string
  icon: string
}

export interface ExportRecord {
  id: string
  variant_id: string
  format: ExportFormat
  size: string
  file_url: string
  created_at: string
}
