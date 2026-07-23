import Stripe from 'stripe'
import { NextResponse, type NextRequest } from 'next/server'
import { getStripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanForPrice, type PaidPlanCode } from '@/lib/billing/plans'

export const runtime = 'nodejs'

function toIso(timestamp: number | null | undefined) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null
}

async function resolveUserId(subscription: Stripe.Subscription) {
  if (subscription.metadata.supabase_user_id) return subscription.metadata.supabase_user_id

  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
  const customer = await getStripe().customers.retrieve(customerId)
  return !customer.deleted ? customer.metadata.supabase_user_id : null
}

async function syncSubscription(subscription: Stripe.Subscription, eventCreated: number) {
  const userId = await resolveUserId(subscription)
  if (!userId) throw new Error(`Subscription ${subscription.id} has no Supabase user mapping.`)

  const item = subscription.items.data[0]
  const priceId = item?.price.id
  const planCode = (subscription.metadata.plan_code || getPlanForPrice(priceId)) as PaidPlanCode | null
  if (!planCode) throw new Error(`Subscription ${subscription.id} uses an unknown price.`)

  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
  const active = ['active', 'trialing', 'past_due'].includes(subscription.status)
  const admin = createAdminClient()
  const { error } = await admin.rpc('apply_stripe_subscription_event', {
    p_user_id: userId,
    p_stripe_customer_id: customerId,
    p_stripe_subscription_id: subscription.id,
    p_stripe_price_id: priceId,
    p_plan_code: planCode,
    p_status: subscription.status,
    p_current_period_start: toIso(item?.current_period_start),
    p_current_period_end: toIso(item?.current_period_end),
    p_cancel_at_period_end: subscription.cancel_at_period_end,
    p_stripe_event_created: eventCreated,
    p_active: active,
  })
  if (error) throw error
}

async function claimWebhookEvent(event: Stripe.Event) {
  const admin = createAdminClient()
  const { error } = await admin.from('stripe_webhook_events').insert({
    event_id: event.id,
    event_type: event.type,
    stripe_created_at: event.created,
    status: 'processing',
  })
  if (!error) return true
  if (error.code !== '23505') throw error

  const { data: existing, error: existingError } = await admin
    .from('stripe_webhook_events')
    .select('status, attempts, updated_at')
    .eq('event_id', event.id)
    .single()
  if (existingError) throw existingError
  if (existing.status === 'processed') return false

  const stale = Date.now() - new Date(existing.updated_at).getTime() > 5 * 60 * 1000
  if (existing.status === 'processing' && !stale) return false

  const { error: retryError } = await admin.from('stripe_webhook_events').update({
    status: 'processing',
    attempts: existing.attempts + 1,
    last_error: null,
  }).eq('event_id', event.id)
  if (retryError) throw retryError
  return true
}

async function finishWebhookEvent(eventId: string, status: 'processed' | 'failed', error?: unknown) {
  const message = status === 'failed'
    ? (error instanceof Error ? error.message.slice(0, 500) : 'Unknown processing error')
    : null
  const { error: updateError } = await createAdminClient().from('stripe_webhook_events').update({
    status,
    last_error: message,
    processed_at: status === 'processed' ? new Date().toISOString() : null,
  }).eq('event_id', eventId)
  if (updateError) throw updateError
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook signature configuration is missing.' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 })
  }

  let claimed = false
  try {
    claimed = await claimWebhookEvent(event)
    if (!claimed) return NextResponse.json({ received: true, duplicate: true })

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        if (typeof session.subscription === 'string') {
          await syncSubscription(await getStripe().subscriptions.retrieve(session.subscription), event.created)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(event.data.object, event.created)
        break
      default:
        break
    }
    await finishWebhookEvent(event.id, 'processed')
  } catch (error) {
    if (claimed) await finishWebhookEvent(event.id, 'failed', error).catch(() => undefined)
    console.error('Stripe webhook processing failed', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
