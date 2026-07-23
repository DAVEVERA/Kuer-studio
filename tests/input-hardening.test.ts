import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('AI request hardening', () => {
  it('accepts only bounded HTTP destinations and prompt input', async () => {
    const validation = await import('@/lib/security/requestValidation').catch(() => null)

    expect(validation).not.toBeNull()
    if (!validation) return
    expect(validation.httpUrlSchema.safeParse('https://mnrv.nl').success).toBe(true)
    expect(validation.httpUrlSchema.safeParse('javascript:alert(1)').success).toBe(false)
    expect(validation.httpUrlSchema.safeParse(`https://mnrv.nl/${'x'.repeat(2100)}`).success).toBe(false)
    expect(validation.promptSchema.safeParse('x'.repeat(2001)).success).toBe(false)
  })

  it('charges quota before paid prompt and vision provider calls', async () => {
    const promptRoute = await readFile('app/api/ai/build-prompt/route.ts', 'utf8')
    const visionRoute = await readFile('app/api/ai/vision-analysis/route.ts', 'utf8')

    expect(promptRoute).toContain('consumeGenerationQuota(1)')
    expect(visionRoute).toContain('consumeGenerationQuota(1)')
  })
})
