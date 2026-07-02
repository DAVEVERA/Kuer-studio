import type { QrProject, QrVariant, ValidationReport } from '@/types/qr'
import type { BrandKit } from '@/types/brand'
import type { ScanEvent } from '@/types/analytics'
import type { ExportRecord } from '@/types/export'

function makeReport(score: number, overrides?: Partial<ValidationReport['checks']>): ValidationReport {
  const base: ValidationReport['checks'] = {
    contrast: score >= 85 ? 'pass' : score >= 70 ? 'warning' : 'fail',
    quietZone: score >= 80 ? 'pass' : 'warning',
    finderPatterns: score >= 75 ? 'pass' : score >= 60 ? 'warning' : 'fail',
    resolution: 'pass',
    ...overrides,
  }
  return {
    isScannable: score >= 80,
    decodedUrl: 'https://example.com',
    urlMatches: true,
    score,
    checks: base,
    recommendations: score >= 90
      ? ['QR code meets all scanability requirements']
      : score >= 80
        ? ['Consider improving contrast for better scan reliability']
        : ['Increase contrast between QR modules and background', 'Simplify artwork near finder patterns'],
  }
}

export const mockBrandKits: BrandKit[] = [
  {
    id: 'bk-1',
    user_id: 'user-1',
    name: 'MNRV Studio',
    logo_url: undefined,
    primary_color: '#0B1117',
    secondary_color: '#E07856',
    accent_color: '#E8B89F',
    font_preference: 'Inter',
    created_at: '2025-11-15T10:00:00Z',
  },
  {
    id: 'bk-2',
    user_id: 'user-1',
    name: 'TechCorp',
    logo_url: undefined,
    primary_color: '#0f172a',
    secondary_color: '#3b82f6',
    accent_color: '#06b6d4',
    font_preference: 'JetBrains Mono',
    created_at: '2025-12-01T14:30:00Z',
  },
  {
    id: 'bk-3',
    user_id: 'user-1',
    name: 'Green Roots Café',
    logo_url: undefined,
    primary_color: '#1a2e1a',
    secondary_color: '#4a7c59',
    accent_color: '#f0e68c',
    font_preference: 'Georgia',
    created_at: '2026-01-10T09:00:00Z',
  },
]

export const mockProjects: QrProject[] = [
  {
    id: 'proj-1',
    user_id: 'user-1',
    brand_kit_id: 'bk-1',
    name: 'Spotify Podcast Launch',
    target_url: 'https://open.spotify.com/show/example',
    short_id: 'sPd7kQ2m',
    type: 'dynamic',
    category: 'podcast',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-06-20T14:00:00Z',
  },
  {
    id: 'proj-2',
    user_id: 'user-1',
    brand_kit_id: 'bk-3',
    name: 'Restaurant Menu',
    target_url: 'https://greenroots.cafe/menu',
    short_id: 'rMn3xK9p',
    type: 'dynamic',
    category: 'menu',
    created_at: '2026-02-01T08:30:00Z',
    updated_at: '2026-06-18T11:00:00Z',
  },
  {
    id: 'proj-3',
    user_id: 'user-1',
    brand_kit_id: 'bk-2',
    name: 'Tech Summit 2026',
    target_url: 'https://techsummit2026.io/register',
    short_id: 'tS26eVnR',
    type: 'dynamic',
    category: 'event',
    created_at: '2026-03-10T16:00:00Z',
    updated_at: '2026-06-22T09:15:00Z',
  },
  {
    id: 'proj-4',
    user_id: 'user-1',
    name: 'Product Box QR',
    target_url: 'https://myproduct.com/setup',
    short_id: 'pBx8qW4j',
    type: 'static',
    category: 'product-packaging',
    created_at: '2026-04-05T12:00:00Z',
    updated_at: '2026-06-15T10:30:00Z',
  },
  {
    id: 'proj-5',
    user_id: 'user-1',
    brand_kit_id: 'bk-2',
    name: 'AR Product Demo',
    target_url: 'https://ar.myproduct.com/experience',
    short_id: 'aRd5mN2v',
    type: 'dynamic',
    category: 'ar-experience',
    created_at: '2026-05-20T14:30:00Z',
    updated_at: '2026-06-21T16:45:00Z',
  },
]

export const mockVariants: QrVariant[] = [
  // Spotify Podcast variants
  {
    id: 'var-1a',
    project_id: 'proj-1',
    prompt: 'Podcast artwork QR with waveform elements, purple gradient. Variant 1.',
    style_preset: 'podcast-artwork',
    image_url: '',
    base_qr_url: '',
    scanability_score: 95,
    validation_status: 'validated',
    validation_report: makeReport(95),
    export_urls: {},
    created_at: '2026-01-15T10:05:00Z',
  },
  {
    id: 'var-1b',
    project_id: 'proj-1',
    prompt: 'Podcast artwork QR with waveform elements, purple gradient. Variant 2.',
    style_preset: 'podcast-artwork',
    image_url: '',
    base_qr_url: '',
    scanability_score: 88,
    validation_status: 'validated',
    validation_report: makeReport(88),
    export_urls: {},
    created_at: '2026-01-15T10:05:00Z',
  },
  {
    id: 'var-1c',
    project_id: 'proj-1',
    prompt: 'Podcast artwork QR with microphone motif, warm orange. Variant 3.',
    style_preset: 'podcast-artwork',
    image_url: '',
    base_qr_url: '',
    scanability_score: 92,
    validation_status: 'validated',
    validation_report: makeReport(92),
    export_urls: {},
    created_at: '2026-01-15T10:05:00Z',
  },
  {
    id: 'var-1d',
    project_id: 'proj-1',
    prompt: 'Dark futuristic podcast QR. Variant 4.',
    style_preset: 'dark-futuristic',
    image_url: '',
    base_qr_url: '',
    scanability_score: 78,
    validation_status: 'needs-contrast-improvement',
    validation_report: makeReport(78),
    export_urls: {},
    created_at: '2026-01-15T10:05:00Z',
  },
  // Restaurant variants
  {
    id: 'var-2a',
    project_id: 'proj-2',
    prompt: 'Restaurant menu QR with warm culinary tones. Variant 1.',
    style_preset: 'restaurant-menu',
    image_url: '',
    base_qr_url: '',
    scanability_score: 96,
    validation_status: 'validated',
    validation_report: makeReport(96),
    export_urls: {},
    created_at: '2026-02-01T09:00:00Z',
  },
  {
    id: 'var-2b',
    project_id: 'proj-2',
    prompt: 'Organic nature menu QR. Variant 2.',
    style_preset: 'organic-nature',
    image_url: '',
    base_qr_url: '',
    scanability_score: 91,
    validation_status: 'validated',
    validation_report: makeReport(91),
    export_urls: {},
    created_at: '2026-02-01T09:00:00Z',
  },
  {
    id: 'var-2c',
    project_id: 'proj-2',
    prompt: 'Restaurant menu QR with botanical textures. Variant 3.',
    style_preset: 'restaurant-menu',
    image_url: '',
    base_qr_url: '',
    scanability_score: 85,
    validation_status: 'validated',
    validation_report: makeReport(85),
    export_urls: {},
    created_at: '2026-02-01T09:00:00Z',
  },
  {
    id: 'var-2d',
    project_id: 'proj-2',
    prompt: 'Premium luxury menu card QR. Variant 4.',
    style_preset: 'premium-luxury',
    image_url: '',
    base_qr_url: '',
    scanability_score: 72,
    validation_status: 'needs-contrast-improvement',
    validation_report: makeReport(72, { contrast: 'fail' }),
    export_urls: {},
    created_at: '2026-02-01T09:00:00Z',
  },
  // Tech Event variants
  {
    id: 'var-3a',
    project_id: 'proj-3',
    prompt: 'Tech circuitboard QR for tech summit. Variant 1.',
    style_preset: 'tech-circuitboard',
    image_url: '',
    base_qr_url: '',
    scanability_score: 94,
    validation_status: 'validated',
    validation_report: makeReport(94),
    export_urls: {},
    created_at: '2026-03-10T16:10:00Z',
  },
  {
    id: 'var-3b',
    project_id: 'proj-3',
    prompt: 'Cyberpunk neon event QR. Variant 2.',
    style_preset: 'cyberpunk-neon',
    image_url: '',
    base_qr_url: '',
    scanability_score: 89,
    validation_status: 'validated',
    validation_report: makeReport(89),
    export_urls: {},
    created_at: '2026-03-10T16:10:00Z',
  },
  {
    id: 'var-3c',
    project_id: 'proj-3',
    prompt: 'Event poster QR with dynamic gradients. Variant 3.',
    style_preset: 'event-poster',
    image_url: '',
    base_qr_url: '',
    scanability_score: 91,
    validation_status: 'validated',
    validation_report: makeReport(91),
    export_urls: {},
    created_at: '2026-03-10T16:10:00Z',
  },
  {
    id: 'var-3d',
    project_id: 'proj-3',
    prompt: 'Corporate clean tech event QR. Variant 4.',
    style_preset: 'corporate-clean',
    image_url: '',
    base_qr_url: '',
    scanability_score: 97,
    validation_status: 'validated',
    validation_report: makeReport(97),
    export_urls: {},
    created_at: '2026-03-10T16:10:00Z',
  },
  // Product Packaging variants
  {
    id: 'var-4a',
    project_id: 'proj-4',
    prompt: 'Product packaging QR with clean print-safe design. Variant 1.',
    style_preset: 'product-packaging',
    image_url: '',
    base_qr_url: '',
    scanability_score: 98,
    validation_status: 'validated',
    validation_report: makeReport(98),
    export_urls: {},
    created_at: '2026-04-05T12:10:00Z',
  },
  {
    id: 'var-4b',
    project_id: 'proj-4',
    prompt: 'Minimal editorial product QR. Variant 2.',
    style_preset: 'minimal-editorial',
    image_url: '',
    base_qr_url: '',
    scanability_score: 93,
    validation_status: 'validated',
    validation_report: makeReport(93),
    export_urls: {},
    created_at: '2026-04-05T12:10:00Z',
  },
  {
    id: 'var-4c',
    project_id: 'proj-4',
    prompt: 'Corporate clean product QR. Variant 3.',
    style_preset: 'corporate-clean',
    image_url: '',
    base_qr_url: '',
    scanability_score: 96,
    validation_status: 'validated',
    validation_report: makeReport(96),
    export_urls: {},
    created_at: '2026-04-05T12:10:00Z',
  },
  {
    id: 'var-4d',
    project_id: 'proj-4',
    prompt: 'Soft community product QR. Variant 4.',
    style_preset: 'soft-community',
    image_url: '',
    base_qr_url: '',
    scanability_score: 82,
    validation_status: 'validated',
    validation_report: makeReport(82),
    export_urls: {},
    created_at: '2026-04-05T12:10:00Z',
  },
  // AR Campaign variants
  {
    id: 'var-5a',
    project_id: 'proj-5',
    prompt: 'Dark futuristic AR campaign QR. Variant 1.',
    style_preset: 'dark-futuristic',
    image_url: '',
    base_qr_url: '',
    scanability_score: 90,
    validation_status: 'validated',
    validation_report: makeReport(90),
    export_urls: {},
    created_at: '2026-05-20T14:40:00Z',
  },
  {
    id: 'var-5b',
    project_id: 'proj-5',
    prompt: 'Cyberpunk neon AR QR. Variant 2.',
    style_preset: 'cyberpunk-neon',
    image_url: '',
    base_qr_url: '',
    scanability_score: 86,
    validation_status: 'validated',
    validation_report: makeReport(86),
    export_urls: {},
    created_at: '2026-05-20T14:40:00Z',
  },
  {
    id: 'var-5c',
    project_id: 'proj-5',
    prompt: 'Tech circuitboard AR QR. Variant 3.',
    style_preset: 'tech-circuitboard',
    image_url: '',
    base_qr_url: '',
    scanability_score: 93,
    validation_status: 'validated',
    validation_report: makeReport(93),
    export_urls: {},
    created_at: '2026-05-20T14:40:00Z',
  },
  {
    id: 'var-5d',
    project_id: 'proj-5',
    prompt: 'Premium luxury AR experience QR. Variant 4.',
    style_preset: 'premium-luxury',
    image_url: '',
    base_qr_url: '',
    scanability_score: 67,
    validation_status: 'not-scannable',
    validation_report: makeReport(67, { contrast: 'fail', finderPatterns: 'warning' }),
    export_urls: {},
    created_at: '2026-05-20T14:40:00Z',
  },
]

function generateDayScanData(days: number): { date: string; count: number }[] {
  const data: { date: string; count: number }[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const base = 30 + Math.floor(Math.random() * 80)
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 0.6 : 1
    data.push({
      date: d.toISOString().split('T')[0],
      count: Math.floor(base * weekend),
    })
  }
  return data
}

export const mockScanEvents: ScanEvent[] = Array.from({ length: 50 }, (_, i) => {
  const devices = ['Mobile', 'Desktop', 'Tablet']
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge']
  const oses = ['iOS', 'Android', 'Windows', 'macOS']
  const countries = ['US', 'NL', 'UK', 'DE', 'FR', 'JP', 'CA', 'AU']
  const cities = ['New York', 'Amsterdam', 'London', 'Berlin', 'Paris', 'Tokyo', 'Toronto', 'Sydney']
  const projectIds = mockProjects.map((p) => p.id)

  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * 30))
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))

  return {
    id: `scan-${i}`,
    project_id: projectIds[Math.floor(Math.random() * projectIds.length)],
    variant_id: undefined,
    timestamp: d.toISOString(),
    user_agent: 'Mozilla/5.0',
    device_type: devices[Math.floor(Math.random() * devices.length)],
    browser: browsers[Math.floor(Math.random() * browsers.length)],
    os: oses[Math.floor(Math.random() * oses.length)],
    country: countries[i % countries.length],
    city: cities[i % cities.length],
    ip_hash: `hash_${i}`,
  }
})

export const mockExportHistory: ExportRecord[] = [
  { id: 'exp-1', variant_id: 'var-1a', format: 'png-1024', size: '1024x1024', file_url: '', created_at: '2026-06-15T10:00:00Z' },
  { id: 'exp-2', variant_id: 'var-2a', format: 'svg', size: 'scalable', file_url: '', created_at: '2026-06-16T11:00:00Z' },
  { id: 'exp-3', variant_id: 'var-3a', format: 'png-2048', size: '2048x2048', file_url: '', created_at: '2026-06-18T09:30:00Z' },
  { id: 'exp-4', variant_id: 'var-4a', format: 'pdf-print', size: 'A4', file_url: '', created_at: '2026-06-19T14:00:00Z' },
  { id: 'exp-5', variant_id: 'var-1a', format: 'social-square', size: '1080x1080', file_url: '', created_at: '2026-06-20T16:00:00Z' },
]

export const mockScansByDay = generateDayScanData(30)

export function getProjectVariants(projectId: string): QrVariant[] {
  return mockVariants.filter((v) => v.project_id === projectId)
}

export function getProjectById(projectId: string): QrProject | undefined {
  return mockProjects.find((p) => p.id === projectId)
}

export function getBrandKitById(id: string): BrandKit | undefined {
  return mockBrandKits.find((bk) => bk.id === id)
}
