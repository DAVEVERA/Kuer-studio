import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth/apiKeyAuth'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const apiKey = await validateApiKey(request.headers.get('authorization'))
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Invalid or missing API key' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    status: 'ok',
    user: apiKey.userId,
    scopes: apiKey.scopes,
    rate_limit: apiKey.rateLimit,
    api_version: 'v1',
    endpoints: {
      generate: 'POST /api/v1/generate',
      status: 'GET /api/v1/status',
    },
  })
}
