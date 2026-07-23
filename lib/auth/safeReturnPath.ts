export function safeReturnPath(value: string | null | undefined, fallback = '/dashboard') {
  if (!value?.startsWith('/') || value.startsWith('//')) return fallback
  return value
}
