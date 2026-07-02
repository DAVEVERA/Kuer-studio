import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KUER Studio — AI-Powered Branded QR Codes',
  description: 'Break free from standard black-and-white QR codes. Generate branded, AI-designed QR codes that stay scannable.',
  keywords: ['QR code', 'branded QR', 'AI design', 'QR generator', 'marketing', 'campaign'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
