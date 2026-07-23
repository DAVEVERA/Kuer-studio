import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const profile = 'kuer-studio'
const apiVersion = '2026-06-24.dahlia'

function stripe(args) {
  const command = process.platform === 'win32' ? process.execPath : 'stripe'
  const prefix = process.platform === 'win32'
    ? [join(process.env.APPDATA, 'npm', 'node_modules', '@stripe', 'cli', 'bin', 'shim.js')]
    : []
  const output = execFileSync(command, [...prefix, ...args, '--project-name', profile, '--stripe-version', apiVersion], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return JSON.parse(output)
}

function stripeText(args) {
  const command = process.platform === 'win32' ? process.execPath : 'stripe'
  const prefix = process.platform === 'win32'
    ? [join(process.env.APPDATA, 'npm', 'node_modules', '@stripe', 'cli', 'bin', 'shim.js')]
    : []
  return execFileSync(command, [...prefix, ...args, '--project-name', profile], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function findProduct(products, plan) {
  return products.find((product) => product.metadata?.kuer_plan === plan || product.name === `KUER ${plan[0].toUpperCase()}${plan.slice(1)}`)
}

function ensureProduct(products, plan, description) {
  const found = findProduct(products, plan)
  if (found) return found

  return stripe([
    'products', 'create',
    '--name', `KUER ${plan[0].toUpperCase()}${plan.slice(1)}`,
    '--description', description,
    '-d', `metadata[kuer_plan]=${plan}`,
    '--confirm',
  ])
}

function ensurePrice(productId, interval, amount, nickname) {
  const prices = stripe(['prices', 'list', '--product', productId, '--limit', '100']).data
  const found = prices.find((price) =>
    price.active &&
    price.currency === 'eur' &&
    price.unit_amount === amount &&
    price.recurring?.interval === interval
  )
  if (found) return found

  return stripe([
    'prices', 'create',
    '--currency', 'eur',
    '--unit-amount', String(amount),
    '--product', productId,
    '--recurring.interval', interval,
    '--nickname', nickname,
    '--confirm',
  ])
}

function ensurePortalConfiguration() {
  const configurations = stripe(['billing_portal', 'configurations', 'list', '--limit', '100']).data
  const found = configurations.find((configuration) => configuration.name === 'KUER Studio Portal')
  if (found) return found

  return stripe([
    'billing_portal', 'configurations', 'create',
    '--name=KUER Studio Portal',
    '--default-return-url=http://localhost:3000/account',
    '--features.customer-update.enabled=true',
    '--features.customer-update.allowed-updates=email',
    '--features.customer-update.allowed-updates=name',
    '--features.invoice-history.enabled=true',
    '--features.payment-method-update.enabled=true',
    '--features.subscription-cancel.enabled=true',
    '--features.subscription-cancel.mode=at_period_end',
    '--features.subscription-cancel.proration-behavior=none',
    '--features.subscription-cancel.cancellation-reason.enabled=true',
    '--features.subscription-cancel.cancellation-reason.options=too_expensive',
    '--features.subscription-cancel.cancellation-reason.options=missing_features',
    '--features.subscription-cancel.cancellation-reason.options=other',
    '--confirm',
  ])
}

function parseEnv(text) {
  const values = new Map()
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (match) values.set(match[1], match[2])
  }
  return values
}

const products = stripe(['products', 'list', '--limit', '100']).data
const pro = ensureProduct(products, 'pro', 'Branded QR creation, analytics, dynamic links, and production exports for professionals.')
const studio = ensureProduct(products, 'studio', 'Advanced collaboration, higher usage limits, and priority generation for studios and teams.')

const proMonthly = ensurePrice(pro.id, 'month', 1900, 'KUER Pro monthly')
const proYearly = ensurePrice(pro.id, 'year', 19000, 'KUER Pro yearly')
const studioMonthly = ensurePrice(studio.id, 'month', 4900, 'KUER Studio monthly')
const studioYearly = ensurePrice(studio.id, 'year', 49000, 'KUER Studio yearly')
const portalConfiguration = ensurePortalConfiguration()

const config = await readFile(join(homedir(), '.config', 'stripe', 'config.toml'), 'utf8')
const section = config.match(new RegExp(`\\[${profile.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\]([\\s\\S]*?)(?=\\n\\[|$)`))?.[1] ?? ''
const apiKey = section.match(/^test_mode_api_key\s*=\s*["']?([^"'\r\n]+)["']?/m)?.[1]?.trim()
if (!apiKey) throw new Error(`Could not read the ${profile} Stripe test key.`)

const envPath = new URL('../.env.local', import.meta.url)
const env = parseEnv(await readFile(envPath, 'utf8').catch(() => ''))
env.set('STRIPE_SECRET_KEY', apiKey)
env.set('NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID', proMonthly.id)
env.set('NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID', proYearly.id)
env.set('NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID', studioMonthly.id)
env.set('NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID', studioYearly.id)
env.set('STRIPE_PORTAL_CONFIGURATION_ID', portalConfiguration.id)
const webhookSecret = stripeText(['listen', '--print-secret'])
if (!webhookSecret.startsWith('whsec_')) throw new Error('Stripe CLI did not return a webhook signing secret.')
env.set('STRIPE_WEBHOOK_SECRET', webhookSecret)

await writeFile(envPath, `${[...env].map(([key, value]) => `${key}=${value}`).join('\n')}\n`, { mode: 0o600 })
console.log(JSON.stringify({
  sandbox: profile,
  products: { pro: pro.id, studio: studio.id },
  prices: {
    pro_monthly: proMonthly.id,
    pro_yearly: proYearly.id,
    studio_monthly: studioMonthly.id,
    studio_yearly: studioYearly.id,
  },
  portal_configuration: portalConfiguration.id,
}))
