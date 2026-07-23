import 'server-only'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export class UserRateLimitError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 429 | 503,
    readonly retryAfter?: number
  ) {
    super(message)
  }
}

export async function enforceUserRateLimit(bucket: string, requestLimit: number, windowSeconds = 60) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) throw new UserRateLimitError('Authentication required.', 401)

  const admin = createAdminClient()
  const { data: rpcData, error } = await admin.rpc('consume_request_rate_limit', {
    p_identity_key: `user:${userId}`,
    p_bucket: bucket,
    p_limit: requestLimit,
    p_window_seconds: windowSeconds,
  })
  const decision = Array.isArray(rpcData) ? rpcData[0] : null
  const allowed = rpcData?.[0]?.allowed

  if (
    error ||
    !decision ||
    typeof allowed !== 'boolean' ||
    typeof decision.retry_after !== 'number'
  ) {
    throw new UserRateLimitError('Rate limit service unavailable.', 503)
  }
  if (!allowed) {
    throw new UserRateLimitError('Too many requests. Please try again shortly.', 429, decision.retry_after)
  }

  return userId
}

export function userRateLimitResponse(error: unknown) {
  if (!(error instanceof UserRateLimitError)) {
    return NextResponse.json({ error: 'Rate limit service unavailable.' }, { status: 503 })
  }

  return NextResponse.json(
    { error: error.message },
    {
      status: error.status,
      headers: error.retryAfter ? { 'Retry-After': String(error.retryAfter) } : undefined,
    }
  )
}
