export type PaidPlanCode = 'pro' | 'studio'
export type BillingInterval = 'monthly' | 'yearly'

export interface PricingPlan {
  code: 'free' | PaidPlanCode
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  limits: {
    projects: number | null
    monthlyGenerations: number
    brandKits: number | null
  }
}

export const pricingPlans: PricingPlan[] = [
  {
    code: 'free',
    name: 'Free',
    description: 'Explore KUER Studio and publish your first branded QR campaign.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['3 QR projects', '20 generations per month', '1 brand kit', 'PNG export'],
    limits: { projects: 3, monthlyGenerations: 20, brandKits: 1 },
  },
  {
    code: 'pro',
    name: 'Pro',
    description: 'For professionals running active campaigns and dynamic destinations.',
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: ['Unlimited QR projects', '500 generations per month', '10 brand kits', 'Analytics and dynamic links', 'PNG, SVG and PDF exports'],
    limits: { projects: null, monthlyGenerations: 500, brandKits: 10 },
  },
  {
    code: 'studio',
    name: 'Studio',
    description: 'For studios and teams that need higher limits and priority throughput.',
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: ['Everything in Pro', '2,500 generations per month', 'Unlimited brand kits', 'Priority generation', 'Advanced export presets'],
    limits: { projects: null, monthlyGenerations: 2500, brandKits: null },
  },
]

export const stripePriceIds = {
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID ?? '',
  },
  studio: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID ?? '',
    yearly: process.env.NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID ?? '',
  },
} as const

export function isBillingEnabled() {
  return process.env.BILLING_ENABLED === 'true'
}

export function isAllowedPrice(priceId: string): priceId is string {
  return Object.values(stripePriceIds).some((intervals) => Object.values(intervals).includes(priceId))
}

export function getPlanForPrice(priceId: string): PaidPlanCode | null {
  for (const [plan, intervals] of Object.entries(stripePriceIds)) {
    if (Object.values(intervals).includes(priceId)) return plan as PaidPlanCode
  }
  return null
}
