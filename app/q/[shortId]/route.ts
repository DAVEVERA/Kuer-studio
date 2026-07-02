import { NextRequest, NextResponse } from 'next/server'

const mockRedirects: Record<string, string> = {
  'abc123': 'https://open.spotify.com/show/example',
  'def456': 'https://restaurant.example.com/menu',
  'ghi789': 'https://techconf.example.com',
  'jkl012': 'https://brand.example.com/serum',
  'mno345': 'https://ar.example.com/summer',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await params

  const targetUrl = mockRedirects[shortId]

  if (!targetUrl) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  const referer = request.headers.get('referer') ?? ''

  console.log('[scan-event]', {
    shortId,
    timestamp: new Date().toISOString(),
    userAgent: userAgent.substring(0, 200),
    referer: referer.substring(0, 200),
  })

  return NextResponse.redirect(targetUrl)
}
