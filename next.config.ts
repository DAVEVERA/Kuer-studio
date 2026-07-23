import type { NextConfig } from 'next'

export function buildContentSecurityPolicy(isDevelopment: boolean) {
  const scriptSources = ["'self'", "'unsafe-inline'", "'wasm-unsafe-eval'"]
  if (isDevelopment) scriptSources.push("'unsafe-eval'")

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    `script-src ${scriptSources.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co https://*.replicate.delivery",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.replicate.com https://api.openai.com",
    "frame-src https://*.stripe.com",
    "form-action 'self' https://*.stripe.com",
    'frame-ancestors https://mnrv.nl https://www.mnrv.nl',
    'upgrade-insecure-requests',
  ].join('; ')
}

const contentSecurityPolicy = buildContentSecurityPolicy(process.env.NODE_ENV === 'development')

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.replicate.delivery',
      },
    ],
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: contentSecurityPolicy },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
      ],
    }]
  },
}

export default nextConfig
