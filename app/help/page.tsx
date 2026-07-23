import Link from 'next/link'
import { AppShell } from '@/components/AppShell'

export default function HelpPage() {
  return (
    <AppShell>
      <div className="help-page space-y-6">
        <div><h1>KUER Studio Help</h1><p>Quick routes for the complete production workflow.</p></div>
        <div className="help-grid">
          <section className="win95-panel"><div className="win95-panel-title">1. Create</div><p>Enter a destination, select a QR type, generate validated variants, then save the project.</p><Link className="win95-button-link" href="/create">Open QR Designer</Link></section>
          <section className="win95-panel"><div className="win95-panel-title">2. Manage</div><p>Edit dynamic destinations, inspect variants and export production assets.</p><Link className="win95-button-link" href="/projects">Open Projects</Link></section>
          <section className="win95-panel"><div className="win95-panel-title">3. Measure</div><p>Dynamic redirects record privacy-preserving scan events for your analytics.</p><Link className="win95-button-link" href="/analytics">Open Analytics</Link></section>
          <section className="win95-panel"><div className="win95-panel-title">4. Account</div><p>Update your profile, change plan or open Stripe's secure Customer Portal.</p><Link className="win95-button-link" href="/account">Open My Account</Link></section>
        </div>
      </div>
    </AppShell>
  )
}
