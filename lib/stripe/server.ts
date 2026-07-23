import 'server-only'

import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function shouldApplyStripeEvent(incomingCreated: number, currentCreated?: number | null) {
  return !currentCreated || incomingCreated >= currentCreated
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not configured.')

  stripeClient ??= new Stripe(secretKey, {
    apiVersion: '2026-06-24.dahlia',
    appInfo: { name: 'KUER Studio', version: '0.1.0' },
  })

  return stripeClient
}
