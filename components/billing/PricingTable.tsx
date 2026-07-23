'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PricingPlan } from '@/lib/billing/plans'

interface PricingTableProps {
  authenticated: boolean
  billingEnabled: boolean
  plans: PricingPlan[]
  priceIds: Record<'pro' | 'studio', Record<'monthly' | 'yearly', string>>
}

export function PricingTable({ authenticated, billingEnabled, plans, priceIds }: PricingTableProps) {
  const [yearly, setYearly] = useState(false)
  const interval = yearly ? 'yearly' : 'monthly'

  return (
    <div className="pricing-shell">
      <div className="pricing-toggle" role="group" aria-label="Billing interval">
        <button type="button" className={!yearly ? 'is-pressed' : ''} onClick={() => setYearly(false)}>Monthly</button>
        <button type="button" className={yearly ? 'is-pressed' : ''} onClick={() => setYearly(true)}>Yearly (save 2 months)</button>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <article key={plan.code} className="win95-panel pricing-card">
            <div className="pricing-card-title">{plan.name}</div>
            <p>{plan.description}</p>
            <div className="pricing-amount">
              <strong>&euro;{yearly ? plan.yearlyPrice : plan.monthlyPrice}</strong>
              <span>/{yearly ? 'year' : 'month'}</span>
            </div>
            <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>

            {plan.code === 'free' ? (
              <Link className="win95-button-link" href={authenticated ? '/dashboard' : '/login?next=/dashboard'}>
                {authenticated ? 'Open Dashboard' : 'Start Free'}
              </Link>
            ) : !billingEnabled ? (
              <button type="button" disabled>Available after beta</button>
            ) : authenticated ? (
              <form method="post" action="/api/stripe/checkout" target="_top">
                <input type="hidden" name="priceId" value={priceIds[plan.code][interval]} />
                <button type="submit" disabled={!priceIds[plan.code][interval]}>Choose {plan.name}</button>
              </form>
            ) : (
              <Link className="win95-button-link" href={`/login?next=${encodeURIComponent('/pricing')}`}>Log in to choose {plan.name}</Link>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
