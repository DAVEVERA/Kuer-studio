import { parseUserAgent } from './parseUserAgent'
import { hashIp } from './hashIp'
import { insertScanEvent } from '@/lib/db/queries'

export async function trackScan(options: {
  projectId: string
  variantId?: string
  userAgent: string
  ip: string
  country?: string
  city?: string
}) {
  const { deviceType, browser, os } = parseUserAgent(options.userAgent)
  const ipHash = await hashIp(options.ip)

  await insertScanEvent({
    project_id: options.projectId,
    variant_id: options.variantId,
    timestamp: new Date().toISOString(),
    user_agent: options.userAgent,
    device_type: deviceType,
    browser,
    os,
    country: options.country ?? 'Unknown',
    city: options.city ?? 'Unknown',
    ip_hash: ipHash,
  })
}
