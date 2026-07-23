import { NextResponse } from 'next/server'
import { env, hasAiProvider, hasPromptProvider, hasSupabaseAdmin } from '@/lib/env'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isLiveStripeKey(value: string | undefined) {
  return /^(rk|sk)_live_/.test(value ?? '')
}

type ProviderCheck = 'configured' | 'fallback' | 'unconfigured' | 'disabled' | 'error'

async function probeJson(
  url: string,
  headers: Record<string, string>,
  validate: (value: Record<string, unknown>) => boolean
) {
  try {
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(3500),
    })
    if (!response.ok) return false
    return validate(await response.json() as Record<string, unknown>)
  } catch {
    return false
  }
}

function stripePriceIds() {
  return [
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID,
  ]
}

function hasStripeConfiguration() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const priceIds = stripePriceIds()
  return Boolean(
    secretKey &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    priceIds.every(Boolean)
  )
}

async function probeStripeConfiguration(): Promise<ProviderCheck> {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const priceIds = stripePriceIds()
  if (
    !isLiveStripeKey(secretKey) ||
    !webhookSecret?.startsWith('whsec_') ||
    priceIds.some((priceId) => !priceId?.startsWith('price_'))
  ) return 'unconfigured'

  const valid = await Promise.all(priceIds.map((priceId) => probeJson(
    `https://api.stripe.com/v1/prices/${encodeURIComponent(priceId!)}`,
    { Authorization: `Bearer ${secretKey}` },
    (price) => price.livemode === true && price.active === true
  )))
  return valid.every(Boolean) ? 'configured' : 'error'
}

async function probeReplicateConfiguration(): Promise<ProviderCheck> {
  if (!env.aiProviderKey.startsWith('r8_')) return 'unconfigured'
  const valid = await probeJson(
    `${env.aiProviderUrl.replace(/\/$/, '')}/v1/account`,
    { Authorization: `Bearer ${env.aiProviderKey}` },
    (account) => typeof account.username === 'string'
  )
  return valid ? 'configured' : 'error'
}

async function probeOpenAiConfiguration(): Promise<ProviderCheck> {
  if (!env.openaiApiKey.startsWith('sk-')) return 'unconfigured'
  const models = [...new Set([env.aiPromptModel, env.openaiVisionModel])]
  const valid = await Promise.all(models.map((model) => probeJson(
    `https://api.openai.com/v1/models/${encodeURIComponent(model)}`,
    { Authorization: `Bearer ${env.openaiApiKey}` },
    (result) => result.id === model
  )))
  return valid.every(Boolean) ? 'configured' : 'error'
}

export async function GET() {
  const isProduction = process.env.VERCEL_ENV === 'production'
  const billingEnabled = process.env.BILLING_ENABLED === 'true'
  let database: 'ok' | 'error' | 'unconfigured' = hasSupabaseAdmin() ? 'error' : 'unconfigured'
  let aiGeneration: ProviderCheck = hasAiProvider() ? 'configured' : 'unconfigured'
  let aiPrompt: ProviderCheck = hasPromptProvider() ? 'configured' : 'fallback'
  let stripe: ProviderCheck = billingEnabled
    ? (hasStripeConfiguration() ? 'configured' : 'unconfigured')
    : 'disabled'

  if (hasSupabaseAdmin()) {
    try {
      const { error } = await createAdminClient()
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .abortSignal(AbortSignal.timeout(3000))
      database = error ? 'error' : 'ok'
    } catch {
      database = 'error'
    }
  }

  if (isProduction) {
    [aiGeneration, aiPrompt, stripe] = await Promise.all([
      probeReplicateConfiguration(),
      hasPromptProvider() ? probeOpenAiConfiguration() : Promise.resolve('fallback' as const),
      billingEnabled ? probeStripeConfiguration() : Promise.resolve('disabled' as const),
    ])
  }

  const checks = {
    database,
    aiGeneration,
    aiPrompt,
    stripe,
    billing: billingEnabled ? 'enabled' : 'disabled',
    scanPrivacy: process.env.SCAN_HASH_SALT && (!isProduction || process.env.SCAN_HASH_SALT.length >= 32)
      ? 'configured' : 'unconfigured',
    publicUrl: !isProduction || env.baseUrl === 'https://studio.mnrv.nl' ? 'configured' : 'invalid',
  } as const
  const ready =
    checks.database === 'ok' &&
    checks.aiGeneration === 'configured' &&
    (checks.aiPrompt === 'configured' || checks.aiPrompt === 'fallback') &&
    (checks.stripe === 'configured' || checks.stripe === 'disabled') &&
    checks.scanPrivacy === 'configured' &&
    checks.publicUrl === 'configured'

  return NextResponse.json({
    status: ready ? 'ready' : 'degraded',
    checks,
    release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? 'local',
    timestamp: new Date().toISOString(),
  }, {
    status: ready ? 200 : 503,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
}
