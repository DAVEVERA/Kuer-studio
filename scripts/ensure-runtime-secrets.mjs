import { randomBytes } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const envPath = new URL('../.env.local', import.meta.url)
const text = await readFile(envPath, 'utf8').catch(() => '')
const values = new Map()
for (const line of text.split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
  if (match) values.set(match[1], match[2])
}

if (!values.get('SCAN_HASH_SALT')) values.set('SCAN_HASH_SALT', randomBytes(32).toString('hex'))
await writeFile(envPath, `${[...values].map(([key, value]) => `${key}=${value}`).join('\n')}\n`, { mode: 0o600 })
console.log('Runtime secrets are present without printing their values.')
