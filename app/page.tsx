import Link from 'next/link'
import { Download, FolderOpen, QrCode, ScanLine, ShieldCheck, Sparkles } from 'lucide-react'
import { AppShell } from '@/components/AppShell'

const tools = [
  {
    icon: Sparkles,
    title: 'Create QR',
    description: 'Build a branded QR code from a URL, image, or campaign brief.',
    href: '/create',
  },
  {
    icon: ShieldCheck,
    title: 'Validate',
    description: 'Check scanability, contrast, quiet zones, and finder patterns.',
    href: '/projects',
  },
  {
    icon: Download,
    title: 'Export',
    description: 'Prepare production-ready PNG, SVG, PDF, and social assets.',
    href: '/exports',
  },
]

export default function HomePage() {
  return (
    <AppShell>
      <div className="win95-home">
        <section className="win95-welcome-panel">
          <div className="win95-welcome-copy">
            <p className="win95-kicker">KUER STUDIO 95</p>
            <h1>Branded QR codes, built differently.</h1>
            <p>
              Design expressive QR artwork while KUER protects the parts that keep every code scannable.
              Create, test, manage, and export from one desktop workspace.
            </p>
            <div className="win95-home-actions">
              <Link href="/create" className="win95-button win95-button-preferred">
                <QrCode aria-hidden="true" /> Open QR Designer
              </Link>
              <Link href="/dashboard" className="win95-button">
                <FolderOpen aria-hidden="true" /> View Dashboard
              </Link>
            </div>
          </div>

          <div className="win95-qr-program" aria-label="Stylized QR program icon">
            <div className="win95-qr-title">QR.EXE</div>
            <div className="win95-qr-canvas">
              <span /><span /><span />
              <span /><span /><span />
              <span /><span /><span />
            </div>
            <div className="win95-qr-caption"><ScanLine aria-hidden="true" /> Scan-safe artwork</div>
          </div>
        </section>

        <fieldset className="win95-groupbox">
          <legend>What would you like to do?</legend>
          <div className="win95-tool-grid">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link key={tool.title} href={tool.href} className="win95-tool-item">
                  <span className="win95-tool-icon"><Icon aria-hidden="true" /></span>
                  <span>
                    <strong>{tool.title}</strong>
                    <small>{tool.description}</small>
                  </span>
                </Link>
              )
            })}
          </div>
        </fieldset>

        <div className="win95-home-footer">
          <span>AI-assisted design</span>
          <span>Multi-scanner validation</span>
          <span>Print-ready exports</span>
        </div>
      </div>
    </AppShell>
  )
}
