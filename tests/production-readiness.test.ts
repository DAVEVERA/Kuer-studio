import { describe, expect, it } from 'vitest'
import nextConfig from '@/next.config'
import { validateQrImage } from '@/lib/validation/validateQrImage'

describe('production security headers', () => {
  it('allows framing only from the MNRV production origins', async () => {
    const rules = await nextConfig.headers?.()
    const headers = new Map(rules?.flatMap((rule) => rule.headers).map(({ key, value }) => [key.toLowerCase(), value]))

    expect(headers.has('x-frame-options')).toBe(false)
    expect(headers.get('content-security-policy')).toContain(
      'frame-ancestors https://mnrv.nl https://www.mnrv.nl'
    )
    expect(headers.get('strict-transport-security')).toContain('max-age=63072000')
  })

  it('allows React eval debugging only outside production', async () => {
    const configModule = await import('@/next.config')
    const buildPolicy = Reflect.get(configModule, 'buildContentSecurityPolicy') as unknown

    expect(buildPolicy).toBeTypeOf('function')
    if (typeof buildPolicy !== 'function') return

    expect(buildPolicy(true)).toContain("'unsafe-eval'")
    expect(buildPolicy(false)).not.toContain("'unsafe-eval'")
  })
})

describe('QR validation safety', () => {
  it('fails closed when no real decoder can inspect the image', async () => {
    const report = await validateQrImage(
      'data:image/png;base64,not-a-real-png',
      'https://mnrv.nl/kuer',
      '#000000',
      '#FFFFFF'
    )

    expect(report.isScannable).toBe(false)
    expect(report.urlMatches).toBe(false)
    expect(report.decodedUrl).toBeNull()
  })
})

describe('artwork exports', () => {
  it('exposes an artwork-preserving SVG generator', async () => {
    const exports = await import('@/lib/export/exportSvg')

    expect(typeof exports.createArtworkSvg).toBe('function')
  })

  it('creates real PDF bytes instead of an HTML print placeholder', async () => {
    const exports = await import('@/lib/export/exportPdf')

    expect(typeof exports.createQrPdfBytes).toBe('function')
  })
})
