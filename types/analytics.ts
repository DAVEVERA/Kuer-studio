export interface ScanEvent {
  id: string
  project_id: string
  variant_id?: string
  timestamp: string
  user_agent: string
  device_type: string
  browser: string
  os: string
  country: string
  city: string
  ip_hash: string
}

export interface AnalyticsSummary {
  totalScans: number
  scansToday: number
  topCountry: string
  topDevice: string
  scansByDay: { date: string; count: number }[]
  deviceBreakdown: { device: string; count: number }[]
  browserBreakdown: { browser: string; count: number }[]
  countryBreakdown: { country: string; count: number }[]
}
