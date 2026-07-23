import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/server'
import { env } from '@/lib/env'
import { isBillingEnabled } from '@/lib/billing/plans'

export async function POST(request: NextRequest) {
  if (!isBillingEnabled()) {
    return NextResponse.json({ error: 'Paid billing is not available during the beta.' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (!userId) return NextResponse.redirect(new URL('/login?next=/account', request.url), { status: 303 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle()

  if (!profile?.stripe_customer_id) {
    return NextResponse.redirect(new URL('/pricing?billing=none', request.url), { status: 303 })
  }

  const portal = await getStripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID || undefined,
    return_url: `${env.baseUrl || request.nextUrl.origin}/account`,
  })

  return NextResponse.redirect(portal.url, { status: 303 })
}
