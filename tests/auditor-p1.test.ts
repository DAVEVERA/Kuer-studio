import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('independent auditor P1 release gates', () => {
  it('does not allow direct authenticated writes to qr-assets', async () => {
    const foundation = await readFile('supabase/migrations/20260723184020_production_foundation.sql', 'utf8')

    expect(foundation).not.toContain('create policy qr_assets_insert_own_folder')
    expect(foundation).not.toContain('create policy qr_assets_update_own_folder')
    expect(foundation).not.toContain('create policy qr_assets_delete_own_folder')
  })

  it('rate-limits every authenticated AI and QR upload route', async () => {
    const paths = [
      'app/api/ai/build-prompt/route.ts',
      'app/api/ai/generate-batch/route.ts',
      'app/api/ai/immersive-qr/route.ts',
      'app/api/ai/repair/route.ts',
      'app/api/ai/upscale/route.ts',
      'app/api/ai/vision-analysis/route.ts',
      'app/api/assets/qr/route.ts',
    ]
    for (const path of paths) {
      expect(await readFile(path, 'utf8'), path).toContain('enforceUserRateLimit(')
    }

    const helper = await readFile('lib/auth/userRateLimit.ts', 'utf8')
    expect(helper).toContain('p_identity_key:')
    expect(helper).toContain('p_limit:')
    expect(helper).toContain('rpcData?.[0]?.allowed')
    expect(helper).not.toContain('p_request_limit:')
  })

  it('sanitizes post-auth return paths', async () => {
    const redirects = await import('@/lib/auth/safeReturnPath').catch(() => null)

    expect(redirects).not.toBeNull()
    if (!redirects) return
    expect(redirects.safeReturnPath('/projects?view=grid')).toBe('/projects?view=grid')
    expect(redirects.safeReturnPath('//evil.example')).toBe('/dashboard')
    expect(redirects.safeReturnPath('https://evil.example')).toBe('/dashboard')
  })

  it('applies Stripe subscription ordering atomically in SQL', async () => {
    const webhook = await readFile('app/api/stripe/webhook/route.ts', 'utf8')

    expect(webhook).toContain(".rpc('apply_stripe_subscription_event'")
    expect(webhook).not.toContain(".select('stripe_event_created')")
  })

  it('includes production URL and live Stripe checks in readiness', async () => {
    const health = await readFile('app/api/health/route.ts', 'utf8')

    expect(health).toContain("checks.publicUrl === 'configured'")
    expect(health).toContain('isLiveStripeKey')
    expect(health).toContain('probeStripeConfiguration')
    expect(health).toContain('probeReplicateConfiguration')
    expect(health).toContain('probeOpenAiConfiguration')
  })

  it('uses native accessible upload controls', async () => {
    const image = await readFile('components/qr/ImageUploadPanel.tsx', 'utf8')
    const logo = await readFile('components/editor/LogoUpload.tsx', 'utf8')

    expect(image).toContain('aria-label="Upload an image"')
    expect(image).toContain('aria-label="Remove uploaded image"')
    expect(logo).toContain('aria-label="Upload a logo"')
    expect(logo).toContain('aria-label="Remove logo"')
  })

  it('keeps mobile text readable and window controls touch-sized', async () => {
    const css = await readFile('app/globals.css', 'utf8')

    expect(css).toMatch(/@media \(max-width: 720px\)[\s\S]*?body \{\s*font-size: 16px;/)
    expect(css).toMatch(/\.win95-window-controls button,[\s\S]*?min-width: 44px;[\s\S]*?min-height: 44px;/)
    expect(css).toMatch(/\.win95-toolbar \{\s*min-height: 44px;/)
    expect(css).toMatch(/button\[aria-label\][\s\S]*?min-width: 44px;/)
  })
})
