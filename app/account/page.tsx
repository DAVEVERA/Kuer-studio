import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabase/server'
import { updateProfile } from './actions'
import { isBillingEnabled } from '@/lib/billing/plans'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  const email = typeof claimsData?.claims?.email === 'string' ? claimsData.claims.email : ''
  const billingEnabled = isBillingEnabled()

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from('profiles').select('full_name, company_name, plan_code').eq('id', userId).maybeSingle(),
    supabase.from('subscriptions').select('status, plan_code, current_period_end, cancel_at_period_end').eq('user_id', userId).maybeSingle(),
  ])

  return (
    <AppShell>
      <div className="page-shell account-page">
        <div className="page-header">
          <div><h1>My Account</h1><p>Identity, profile and subscription controls.</p></div>
        </div>

        <div className="account-grid">
          <section className="win95-panel">
            <div className="win95-panel-title">Account Profile</div>
            <form action={updateProfile} className="settings-form">
              <label>Email<input value={email} disabled /></label>
              <label>Full name<input name="fullName" defaultValue={profile?.full_name ?? ''} maxLength={120} /></label>
              <label>Company<input name="companyName" defaultValue={profile?.company_name ?? ''} maxLength={160} /></label>
              <button type="submit">Save Profile</button>
            </form>
          </section>

          <section className="win95-panel">
            <div className="win95-panel-title">Billing</div>
            <dl className="account-details">
              <div><dt>Plan</dt><dd>{profile?.plan_code ?? 'free'}</dd></div>
              <div><dt>Status</dt><dd>{subscription?.status ?? 'No paid subscription'}</dd></div>
              <div><dt>Renews</dt><dd>{subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-GB') : '--'}</dd></div>
            </dl>
            {!billingEnabled ? (
              <p>Paid billing is paused during the free beta.</p>
            ) : subscription ? (
              <form method="post" action="/api/stripe/portal" target="_top"><button type="submit">Manage Billing</button></form>
            ) : (
              <a className="win95-button-link" href="/pricing">View Pricing</a>
            )}
          </section>

          <section className="win95-panel account-security">
            <div className="win95-panel-title">Security</div>
            <p>Authentication uses passwordless, time-limited email OTPs. Sessions are stored in secure cookies.</p>
            <form method="post" action="/auth/signout"><button type="submit">Log Out</button></form>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
