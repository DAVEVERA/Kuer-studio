import { createBrowserClient } from '@supabase/ssr'
import { env, hasSupabase } from '@/lib/env'

export function getSupabaseClient() {
  if (!hasSupabase()) {
    return null
  }
  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey)
}
