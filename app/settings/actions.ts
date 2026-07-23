'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect('/login?next=/settings')

  const notificationPreferences = {
    scanAlerts: formData.get('scanAlerts') === 'on',
    weeklyReport: formData.get('weeklyReport') === 'on',
    productUpdates: formData.get('productUpdates') === 'on',
    exportComplete: formData.get('exportComplete') === 'on',
  }

  const { error } = await supabase.from('profiles').update({ notification_preferences: notificationPreferences }).eq('id', userId)
  if (error) throw new Error('Could not save notification preferences.')
  revalidatePath('/settings')
}
