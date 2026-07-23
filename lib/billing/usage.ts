import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function consumeGenerationQuota(requested: number, explicitUserId?: string) {
  let userId = explicitUserId
  if (!userId) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()
    userId = data?.claims?.sub
  }
  if (!userId) throw new Error('Authentication required.')

  const { data, error } = await createAdminClient().rpc('consume_generation_quota', {
    p_user_id: userId,
    p_requested: requested,
  }).single()

  if (error) {
    if (error.message.includes('generation_quota_exceeded')) {
      throw new Error('Your monthly generation quota has been reached. Upgrade or wait for the next billing period.')
    }
    throw new Error('Could not verify generation quota.')
  }

  return data as { used: number; quota: number; plan_code: string }
}
