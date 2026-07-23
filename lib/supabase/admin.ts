import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { env, hasSupabaseAdmin } from '@/lib/env'

export function createAdminClient() {
  if (!hasSupabaseAdmin()) {
    throw new Error('SUPABASE_SECRET_KEY is not configured.')
  }

  return createClient(env.supabaseUrl, env.supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
