import { readFile, writeFile } from 'node:fs/promises'

const sourcePath = new URL('../.env vars', import.meta.url)
const targetPath = new URL('../.env.local', import.meta.url)

function parseEnv(text) {
  const values = new Map()

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!match) continue
    values.set(match[1], match[2])
  }

  return values
}

const source = parseEnv(await readFile(sourcePath, 'utf8'))
const existingText = await readFile(targetPath, 'utf8').catch(() => '')
const existing = parseEnv(existingText)

const sourceMappings = {
  NEXT_PUBLIC_SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  SUPABASE_SECRET_KEY: 'SUPABASE_SECRET_KEY',
  SUPABASE_SERVICE_ROLE_SECRET: 'SUPABASE_SERVICE_ROLE_SECRET',
}

for (const [targetKey, sourceKey] of Object.entries(sourceMappings)) {
  const value = source.get(sourceKey)
  if (!value) throw new Error(`Missing ${sourceKey} in .env vars`)
  existing.set(targetKey, value)
}

existing.delete('NEXT_PUBLIC_SUPABASE_ANON_KEY')

const output = `${[...existing.entries()].map(([key, value]) => `${key}=${value}`).join('\n')}\n`
await writeFile(targetPath, output, { encoding: 'utf8', mode: 0o600 })
console.log('Supabase environment synced without printing credentials.')
