export interface ParsedUserAgent {
  deviceType: string
  browser: string
  os: string
}

export function parseUserAgent(ua: string): ParsedUserAgent {
  const deviceType = detectDeviceType(ua)
  const browser = detectBrowser(ua)
  const os = detectOS(ua)
  return { deviceType, browser, os }
}

function detectDeviceType(ua: string): string {
  const lower = ua.toLowerCase()
  if (/tablet|ipad|playbook|silk/.test(lower)) return 'Tablet'
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/.test(lower)) return 'Mobile'
  return 'Desktop'
}

function detectBrowser(ua: string): string {
  if (ua.includes('Edg/') || ua.includes('Edge/')) return 'Edge'
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera'
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari'
  if (ua.includes('Firefox/')) return 'Firefox'
  return 'Other'
}

function detectOS(ua: string): string {
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac OS X') || ua.includes('Macintosh')) return 'macOS'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('Linux')) return 'Linux'
  return 'Other'
}
