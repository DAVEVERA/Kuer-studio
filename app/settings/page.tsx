import Link from 'next/link'
import { Bell, CreditCard, Shield, UserRound } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabase/server'
import { updatePreferences } from './actions'
import { isBillingEnabled } from '@/lib/billing/plans'

interface Preferences {
  scanAlerts?: boolean
  weeklyReport?: boolean
  productUpdates?: boolean
  exportComplete?: boolean
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  const { data: profile } = await supabase.from('profiles').select('plan_code, notification_preferences').eq('id', userId).maybeSingle()
  const preferences = (profile?.notification_preferences ?? {}) as Preferences
  const billingEnabled = isBillingEnabled()

  return (
    <AppShell>
      <div className="max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted text-sm mt-1">Account, billing and notification preferences.</p></div>

        <section className="win95-panel settings-section">
          <div className="win95-panel-title"><UserRound />Account</div>
          <p>Manage your email identity, company profile and OTP session.</p>
          <Link className="win95-button-link" href="/account">Open My Account</Link>
        </section>

        <section className="win95-panel settings-section">
          <div className="win95-panel-title"><Bell />Notifications</div>
          <form action={updatePreferences} className="preference-form">
            {[
              ['scanAlerts', 'Scan alerts', 'Notify me when a dynamic QR is scanned.', preferences.scanAlerts ?? true],
              ['weeklyReport', 'Weekly report', 'Send a weekly performance summary.', preferences.weeklyReport ?? true],
              ['productUpdates', 'Product updates', 'Send major product and feature updates.', preferences.productUpdates ?? false],
              ['exportComplete', 'Export complete', 'Notify me when a queued export completes.', preferences.exportComplete ?? true],
            ].map(([name, label, description, checked]) => (
              <label className="preference-row" key={name as string}><input type="checkbox" name={name as string} defaultChecked={checked as boolean} /><span><strong>{label as string}</strong><small>{description as string}</small></span></label>
            ))}
            <button type="submit">Save Preferences</button>
          </form>
        </section>

        <section className="win95-panel settings-section">
          <div className="win95-panel-title"><CreditCard />Billing</div>
          <p>Current plan: <strong>{profile?.plan_code ?? 'free'}</strong>.</p>
          {billingEnabled ? (
            <div className="button-row"><Link className="win95-button-link" href="/pricing">View Plans</Link><form method="post" action="/api/stripe/portal" target="_top"><button type="submit">Customer Portal</button></form></div>
          ) : (
            <p>Paid billing is paused during the free beta.</p>
          )}
        </section>

        <section className="win95-panel settings-section">
          <div className="win95-panel-title"><Shield />Security</div>
          <p>KUER Studio uses passwordless OTP authentication, secure cookies, and row-level database security.</p>
          <form method="post" action="/auth/signout"><button type="submit">Log Out All Local Session Data</button></form>
        </section>
      </div>
    </AppShell>
  )
}
