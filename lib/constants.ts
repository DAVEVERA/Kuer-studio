import type { DestinationType, FrameStyle, CornerStyle, ModuleStyle } from '@/types/qr'
import type { ExportOption } from '@/types/export'

export const DESTINATION_TYPES: { value: DestinationType; label: string; icon: string }[] = [
  { value: 'website', label: 'Website', icon: 'Globe' },
  { value: 'social-media', label: 'Social Media', icon: 'Share2' },
  { value: 'video', label: 'Video', icon: 'Play' },
  { value: 'ar-experience', label: 'AR Experience', icon: 'Glasses' },
  { value: 'podcast', label: 'Podcast', icon: 'Headphones' },
  { value: 'menu', label: 'Menu', icon: 'UtensilsCrossed' },
  { value: 'payment', label: 'Payment', icon: 'CreditCard' },
  { value: 'event', label: 'Event', icon: 'Calendar' },
  { value: 'product-packaging', label: 'Product Packaging', icon: 'Package' },
  { value: 'campaign', label: 'Campaign', icon: 'Megaphone' },
]

export const FRAME_STYLES: { value: FrameStyle; label: string }[] = [
  { value: 'none', label: 'No Frame' },
  { value: 'simple', label: 'Simple' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'badge', label: 'Badge' },
  { value: 'banner', label: 'Banner' },
]

export const CORNER_STYLES: { value: CornerStyle; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
]

export const MODULE_STYLES: { value: ModuleStyle; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dot', label: 'Dot' },
  { value: 'soft-pixel', label: 'Soft Pixel' },
]

export const CTA_PRESETS = [
  'Scan Me',
  'Join Us',
  'Open Menu',
  'Listen Now',
  'Watch Now',
  'Learn More',
  'Get Started',
  'Visit Us',
  'Book Now',
  'Download App',
]

export const EXPORT_OPTIONS: ExportOption[] = [
  { format: 'png-1024', label: 'PNG 1024px', description: 'Standard digital use', dimensions: '1024×1024', icon: 'Image' },
  { format: 'png-2048', label: 'PNG 2048px', description: 'High resolution', dimensions: '2048×2048', icon: 'Image' },
  { format: 'svg', label: 'Hybrid SVG', description: 'Artwork with crisp QR anchors', icon: 'FileCode' },
  { format: 'pdf', label: 'PDF', description: 'Standard document', icon: 'FileText' },
  { format: 'pdf-print', label: 'Print PDF', description: 'High-resolution A4 document', icon: 'Printer' },
  { format: 'social-square', label: 'Social Square', description: '1:1 aspect ratio', dimensions: '1080×1080', icon: 'Square' },
  { format: 'social-story', label: 'Story', description: '9:16 aspect ratio', dimensions: '1080×1920', icon: 'Smartphone' },
  { format: 'social-landscape', label: 'Landscape', description: '16:9 aspect ratio', dimensions: '1920×1080', icon: 'Monitor' },
  { format: 'a4-poster', label: 'A4 Poster', description: 'Print-ready poster', dimensions: '2480×3508', icon: 'FileText' },
  { format: 'transparent-png', label: 'Transparent PNG', description: 'No background', dimensions: '2048×2048', icon: 'Layers' },
]

export const DEFAULT_EDITOR_STATE = {
  targetUrl: '',
  fgColor: '#000000',
  bgColor: '#FFFFFF',
  brandColors: [],
  logoSize: 20,
  quietZone: 4,
  ctaText: '',
  frameStyle: 'none' as FrameStyle,
  cornerStyle: 'square' as CornerStyle,
  moduleStyle: 'square' as ModuleStyle,
  errorCorrection: 'H' as const,
}
