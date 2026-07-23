'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect('/login?next=/account')

  const fullName = String(formData.get('fullName') ?? '').trim().slice(0, 120)
  const companyName = String(formData.get('companyName') ?? '').trim().slice(0, 160)
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, company_name: companyName })
    .eq('id', userId)

  if (error) throw new Error('Could not update your account profile.')
  revalidatePath('/account')
}
