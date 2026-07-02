import { hasSupabase } from '@/lib/env'

export interface ApiKeyInfo {
  userId: string
  keyName: string
  scopes: string[]
  rateLimit: number
}

export async function validateApiKey(authHeader: string | null): Promise<ApiKeyInfo | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  if (!token) return null

  if (!hasSupabase()) {
    // Dev mode: accept any non-empty key
    if (token.startsWith('kuer_dev_')) {
      return {
        userId: 'dev-user',
        keyName: 'Development Key',
        scopes: ['generate', 'read', 'upscale'],
        rateLimit: 100,
      }
    }
    return null
  }

  // Production: validate against Supabase api_keys table
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const { env } = await import('@/lib/env')

    const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey)

    const keyHash = await hashApiKey(token)
    const { data } = await supabase
      .from('api_keys')
      .select('user_id, name, scopes, rate_limit')
      .eq('key_hash', keyHash)
      .single()

    if (!data) return null

    return {
      userId: data.user_id,
      keyName: data.name,
      scopes: data.scopes ?? ['generate', 'read'],
      rateLimit: data.rate_limit ?? 100,
    }
  } catch {
    return null
  }
}

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
