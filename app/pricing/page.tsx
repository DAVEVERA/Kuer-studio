import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isBillingEnabled, pricingPlans, stripePriceIds } from '@/lib/billing/plans'
import { PricingTable } from '@/components/billing/PricingTable'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const authenticated = Boolean(data?.claims)
  const billingEnabled = isBillingEnabled()

  return (
    <div className="win95-desktop pricing-desktop">
      <section className="win95-window pricing-window">
        <div className="win95-titlebar">
          <div className="win95-titlebar-label"><span className="win95-app-icon">K</span><span>KUER Studio Pricing</span></div>
          <div className="win95-window-controls"><Link href="/" aria-label="Close">&times;</Link></div>
        </div>
        <div className="win95-menubar"><Link href="/"><u>F</u>ile</Link><Link href="/pricing"><u>P</u>ricing</Link><Link href="/login"><u>A</u>ccount</Link></div>
        <div className="pricing-content">
          <header>
            <h1>Choose your KUER Studio edition</h1>
            <p>{billingEnabled ? 'Clear limits, secure checkout, and self-service billing.' : 'KUER Studio is live as a free beta. Paid upgrades will follow later.'}</p>
          </header>
          <PricingTable authenticated={authenticated} billingEnabled={billingEnabled} plans={pricingPlans} priceIds={stripePriceIds} />
        </div>
      </section>
    </div>
  )
}
