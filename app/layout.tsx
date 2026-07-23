import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KUER Studio — Branded QR Codes',
  description: 'Design, validate, manage, and export branded QR codes.',
  keywords: ['QR code', 'branded QR', 'AI design', 'QR generator', 'marketing', 'campaign'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
