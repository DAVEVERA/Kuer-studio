import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/server'
import { getPlanForPrice, isAllowedPrice, isBillingEnabled } from '@/lib/billing/plans'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  if (!isBillingEnabled()) {
    return NextResponse.json({ error: 'Paid billing is not available during the beta.' }, { status: 503 })
  }

  const formData = await request.formData()
  const priceId = String(formData.get('priceId') ?? '')

  if (!isAllowedPrice(priceId)) {
    return NextResponse.json({ error: 'Unknown subscription price.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  const email = typeof claimsData?.claims?.email === 'string' ? claimsData.claims.email : undefined
  if (!userId) return NextResponse.redirect(new URL('/login?next=/pricing', request.url), { status: 303 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, full_name')
    .eq('id', userId)
    .maybeSingle()

  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing', 'past_due'])
    .maybeSingle()

  if (existingSubscription && profile?.stripe_customer_id) {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID || undefined,
      return_url: `${env.baseUrl || request.nextUrl.origin}/account`,
    })
    return NextResponse.redirect(portal.url, { status: 303 })
  }

  const stripe = getStripe()
  let customerId = profile?.stripe_customer_id as string | null | undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      name: profile?.full_name || undefined,
      metadata: { supabase_user_id: userId },
    }, { idempotencyKey: `kuer-customer-${userId}` })
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId)
  }

  const planCode = getPlanForPrice(priceId)
  if (!planCode) return NextResponse.json({ error: 'Price is not mapped to a plan.' }, { status: 400 })

  const origin = env.baseUrl || request.nextUrl.origin
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    allow_promotion_codes: true,
    success_url: `${origin}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
    metadata: { supabase_user_id: userId, plan_code: planCode },
    subscription_data: { metadata: { supabase_user_id: userId, plan_code: planCode } },
    integration_identifier: 'nqtxvrlp',
  })

  if (!session.url) return NextResponse.json({ error: 'Stripe did not return a Checkout URL.' }, { status: 502 })
  return NextResponse.redirect(session.url, { status: 303 })
}
