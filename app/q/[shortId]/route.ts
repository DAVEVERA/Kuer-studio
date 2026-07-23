import { createHash } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function parseDevice(userAgent: string) {
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  if (/mobile|iphone|android/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

function parseBrowser(userAgent: string) {
  if (/edg\//i.test(userAgent)) return 'Edge'
  if (/firefox\//i.test(userAgent)) return 'Firefox'
  if (/chrome\//i.test(userAgent)) return 'Chrome'
  if (/safari\//i.test(userAgent)) return 'Safari'
  return 'Unknown'
}

function parseOs(userAgent: string) {
  if (/windows/i.test(userAgent)) return 'Windows'
  if (/android/i.test(userAgent)) return 'Android'
  if (/iphone|ipad|ios/i.test(userAgent)) return 'iOS'
  if (/mac os/i.test(userAgent)) return 'macOS'
  if (/linux/i.test(userAgent)) return 'Linux'
  return 'Unknown'
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ shortId: string }> }) {
  const { shortId } = await params
  if (!/^[A-Za-z0-9_-]{6,32}$/.test(shortId)) return new NextResponse('QR destination not found.', { status: 404 })

  const admin = createAdminClient()
  const { data: redirect, error } = await admin
    .from('qr_redirects')
    .select('project_id, target_url, is_active')
    .eq('short_id', shortId)
    .maybeSingle()

  if (error || !redirect?.is_active) return new NextResponse('QR destination not found.', { status: 404 })

  let target: URL
  try {
    target = new URL(redirect.target_url)
    if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Unsupported protocol')
  } catch {
    return new NextResponse('QR destination is invalid.', { status: 500 })
  }

  const userAgent = request.headers.get('user-agent') ?? ''
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  const hashSalt = process.env.SCAN_HASH_SALT || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_SECRET
  if (!hashSalt) return new NextResponse('Scan tracking configuration is unavailable.', { status: 503 })
  const ipHash = createHash('sha256').update(`${hashSalt}:${forwardedFor}`).digest('hex')
  await admin.from('scan_events').insert({
    project_id: redirect.project_id,
    user_agent: userAgent.slice(0, 512),
    device_type: parseDevice(userAgent),
    browser: parseBrowser(userAgent),
    os: parseOs(userAgent),
    country: request.headers.get('x-vercel-ip-country') ?? '',
    city: request.headers.get('x-vercel-ip-city') ?? '',
    ip_hash: ipHash,
  })

  const response = NextResponse.redirect(target, 307)
  response.headers.set('Cache-Control', 'no-store')
  return response
}
