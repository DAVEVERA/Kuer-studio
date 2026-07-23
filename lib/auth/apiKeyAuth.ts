import { createHash } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export interface ApiKeyInfo {
  keyId: string
  userId: string
  keyName: string
  scopes: string[]
  rateLimit: number
}

export class ApiRateLimitError extends Error {
  constructor(public readonly retryAfter: number) {
    super('API rate limit exceeded.')
    this.name = 'ApiRateLimitError'
  }
}

export async function validateApiKey(authHeader: string | null): Promise<ApiKeyInfo | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7).trim()
  if (!token.startsWith('kuer_') || token.length < 32) return null

  try {
    const keyHash = createHash('sha256').update(token).digest('hex')
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('api_keys')
      .select('id, user_id, name, scopes, rate_limit, expires_at, revoked_at')
      .eq('key_hash', keyHash)
      .maybeSingle()

    if (error || !data || data.revoked_at || (data.expires_at && new Date(data.expires_at) <= new Date())) return null

    void admin.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id)
    return {
      keyId: data.id,
      userId: data.user_id,
      keyName: data.name,
      scopes: data.scopes ?? ['generate', 'read'],
      rateLimit: data.rate_limit ?? 100,
    }
  } catch {
    return null
  }
}

export async function enforceApiKeyRateLimit(apiKey: ApiKeyInfo): Promise<void> {
  const { data, error } = await createAdminClient().rpc('consume_request_rate_limit', {
    p_identity_key: `api-key:${apiKey.keyId}`,
    p_bucket: 'api-v1',
    p_limit: apiKey.rateLimit,
    p_window_seconds: 60,
  }).single()

  if (error || !data) throw new Error('API rate limit could not be verified.')
  const result = data as { allowed?: unknown; retry_after?: unknown }
  if (typeof result.allowed !== 'boolean') throw new Error('API rate limit returned an invalid response.')
  if (!result.allowed) throw new ApiRateLimitError(Math.max(1, Number(result.retry_after) || 60))
}
