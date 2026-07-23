'use client'

import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

export function createClient() {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    throw new Error('Supabase browser configuration is missing.')
  }

  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey)
}
