import { expect, test, type Page } from '@playwright/test'
import { loadEnvConfig } from '@next/env'
import { createClient } from '@supabase/supabase-js'
import jsQR from 'jsqr'
import sharp from 'sharp'

async function createAuthenticatedBrowserSession(page: Page) {
  loadEnvConfig(process.cwd())
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // GoTrue's generateLink endpoint on this project still requires the legacy
  // service-role JWT; keep the modern secret key as a fallback for other setups.
  const secret = process.env.SUPABASE_SERVICE_ROLE_SECRET ?? process.env.SUPABASE_SECRET_KEY
  if (!url || !secret) throw new Error('Supabase admin credentials are required for the authenticated E2E flow.')

  const admin = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } })
  const email = `kuer-e2e-${Date.now()}@example.com`
  const created = await admin.auth.admin.createUser({ email, email_confirm: true })
  if (created.error || !created.data.user) throw created.error ?? new Error('Could not create E2E user.')

  try {
    const link = await admin.auth.admin.generateLink({ type: 'magiclink', email })
    const tokenHash = link.data.properties?.hashed_token
    if (link.error || !tokenHash) {
      throw link.error ?? new Error('Could not create E2E sign-in link.')
    }

    await page.goto(`/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=email&next=/create`)
    await page.waitForURL('**/create')
  } catch (error) {
    await admin.auth.admin.deleteUser(created.data.user.id)
    throw error
  }

  return async () => {
    await admin.auth.admin.deleteUser(created.data.user.id)
  }
}

test('serves production-safe headers and a healthy backend', async ({ page, request }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  expect(response?.headers()['x-frame-options']).toBeUndefined()
  expect(response?.headers()['content-security-policy']).toContain(
    'frame-ancestors https://mnrv.nl https://www.mnrv.nl'
  )
  await expect(page).toHaveTitle(/KUER/i)

  const health = await request.get('/api/health')
  expect(health.status()).toBe(200)
  expect((await health.json()).status).toBe('ready')
})

test('creates and decodes the exact local-renderer QR destination', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith('mobile'), 'The generation flow is exercised once on desktop.')

  const destination = 'https://mnrv.nl/kuer-e2e'
  const cleanup = await createAuthenticatedBrowserSession(page)
  try {
    const guardedUpload = await page.request.post('/api/assets/qr', {
      multipart: { projectId: 'invalid-project-id' },
    })
    expect(guardedUpload.status()).toBe(400)

    await page.getByLabel('Project name').fill('KUER production browser test')
    await page.getByPlaceholder('example.com').fill(destination)
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: /Skip/ }).click()
    await page.getByRole('button', { name: /Local Renderer/ }).click()
    await page.getByPlaceholder(/Describe your desired QR style/).fill('High contrast editorial geometry')
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: /Generate 4 Variants/ }).click()
    await expect(page.getByRole('heading', { name: 'Your Branded QR Variants' })).toBeVisible()

    const imageSources = await page.locator('img[alt^="Variant "]').evaluateAll((images) =>
      images.map((image) => image.getAttribute('src')).filter((source): source is string => Boolean(source))
    )
    const decodedDestinations: Array<string | undefined> = []
    for (const imageSource of imageSources) {
      expect(imageSource).toMatch(/^data:image\/png;base64,/)
      const png = Buffer.from(imageSource.split(',')[1], 'base64')
      const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      decodedDestinations.push(jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data)
    }

    expect(decodedDestinations).toContain(destination)
  } finally {
    await cleanup()
  }
})

test('blocks embedding from an unapproved ancestor', async ({ page }) => {
  await page.setContent('<iframe title="KUER" src="http://localhost:3100/"></iframe>')
  await page.waitForTimeout(750)
  const frame = page.frames().find((candidate) => candidate !== page.mainFrame())
  expect(frame?.url()).not.toBe('http://localhost:3100/')
})

test('has no 375px horizontal overflow and keeps icon navigation named', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'), 'Mobile-specific release gate.')
  const cleanup = await createAuthenticatedBrowserSession(page)
  try {
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }))
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport)
    expect(await page.locator('a[aria-label]').count()).toBeGreaterThan(0)
    const tapTargets = await page.locator(
      '.win95-toolbar a, .win95-window-content button[aria-label]'
    ).evaluateAll((elements) => elements.map((element) => {
      const bounds = element.getBoundingClientRect()
      return { width: bounds.width, height: bounds.height }
    }))
    expect(tapTargets.length).toBeGreaterThan(0)
    for (const target of tapTargets) {
      expect(target.width).toBeGreaterThanOrEqual(44)
      expect(target.height).toBeGreaterThanOrEqual(44)
    }
  } finally {
    await cleanup()
  }
})
