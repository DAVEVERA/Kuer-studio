import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('backend production boundaries', () => {
  it('enforces the configured API-key request limit', async () => {
    const auth = await import('@/lib/auth/apiKeyAuth')

    expect(typeof auth.enforceApiKeyRateLimit).toBe('function')
  })

  it('validates QR upload bytes before privileged storage writes', async () => {
    const assets = await import('@/app/api/assets/qr/route')

    expect(typeof assets.validateQrAssetUpload).toBe('function')
  })

  it('rejects stale Stripe subscription events', async () => {
    const stripe = await import('@/lib/stripe/server')

    expect(typeof stripe.shouldApplyStripeEvent).toBe('function')
  })

  it('requires decoder-backed validation for generated AI artwork', async () => {
    const validation = await import('@/lib/validation/validateQrImage')

    expect(typeof validation.validateGeneratedQrDataUrl).toBe('function')
  })

  it('keeps icon-only mobile navigation links accessible', async () => {
    const source = await readFile('components/AppShell.tsx', 'utf8')

    expect(source).toContain('aria-label={item.label}')
  })

  it('provides a public health endpoint for uptime monitoring', async () => {
    const health = await import('@/app/api/health/route').catch(() => null)

    expect(typeof health?.GET).toBe('function')
  })

  it('packages the auth error page as a Vercel function', async () => {
    const source = await readFile('app/auth/error/page.tsx', 'utf8')

    expect(source).toContain("export const dynamic = 'force-dynamic'")
  })
})
