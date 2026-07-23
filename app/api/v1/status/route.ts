import { NextResponse } from 'next/server'
import { ApiRateLimitError, enforceApiKeyRateLimit, validateApiKey } from '@/lib/auth/apiKeyAuth'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const apiKey = await validateApiKey(request.headers.get('authorization'))
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Invalid or missing API key' },
      { status: 401 }
    )
  }

  try {
    await enforceApiKeyRateLimit(apiKey)
  } catch (error) {
    if (error instanceof ApiRateLimitError) {
      return NextResponse.json({ error: error.message }, {
        status: 429,
        headers: { 'Retry-After': String(error.retryAfter) },
      })
    }
    return NextResponse.json({ error: 'API rate limit unavailable.' }, { status: 503 })
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
