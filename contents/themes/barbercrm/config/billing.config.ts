import type { BillingConfig } from '@nextsparkjs/core/lib/billing/config-types'

export const billingConfig: BillingConfig = {
  provider: 'stripe',
  currency: 'usd',
  defaultPlan: 'free',

  // ===========================================
  // FEATURE DEFINITIONS
  // ===========================================
  features: {
    online_booking: {
      name: 'billing.features.online_booking',
      description: 'billing.features.online_booking_description',
    },
    analytics: {
      name: 'billing.features.analytics',
      description: 'billing.features.analytics_description',
    },
    priority_support: {
      name: 'billing.features.priority_support',
      description: 'billing.features.priority_support_description',
    },
  },

  // ===========================================
  // LIMIT DEFINITIONS
  // ===========================================
  limits: {
    barbers: {
      name: 'billing.limits.barbers',
      unit: 'count',
      resetPeriod: 'never',
    },
    appointments_per_month: {
      name: 'billing.limits.appointments_per_month',
      unit: 'count',
      resetPeriod: 'monthly',
    },
  },

  // ===========================================
  // PLAN DEFINITIONS
  // ===========================================
  plans: [
    {
      slug: 'starter',
      name: 'billing.plans.starter.name',
      description: 'billing.plans.starter.description',
      type: 'paid',
      visibility: 'public',
      price: {
        monthly: 1500,   // $15.00
        yearly: 14400,   // $144.00 (20% off)
      },
      trialDays: 7,
      features: [
        'online_booking',
      ],
      limits: {
        barbers: 1,
        appointments_per_month: 100,
      },
      providerPriceIds: { monthly: 'price_starter_monthly', yearly: 'price_starter_yearly' },
    },
    {
      slug: 'pro',
      name: 'billing.plans.pro.name',
      description: 'billing.plans.pro.description',
      type: 'paid',
      visibility: 'public',
      price: {
        monthly: 2900,   // $29.00
        yearly: 27840,   // $278.40 (20% off)
      },
      trialDays: 14,
      features: [
        'online_booking',
        'priority_support',
      ],
      limits: {
        barbers: 3,
        appointments_per_month: 300,
      },
      providerPriceIds: { monthly: 'price_pro_monthly', yearly: 'price_pro_yearly' },
    },
    {
      slug: 'business',
      name: 'billing.plans.business.name',
      description: 'billing.plans.business.description',
      type: 'paid',
      visibility: 'public',
      price: {
        monthly: 4900,   // $49.00
        yearly: 47040,   // $470.40 (20% off)
      },
      trialDays: 14,
      features: [
        'online_booking',
        'analytics',
        'priority_support',
      ],
      limits: {
        barbers: -1,
        appointments_per_month: -1,
      },
      providerPriceIds: { monthly: 'price_business_monthly', yearly: 'price_business_yearly' },
    },
  ],

  // ===========================================
  // ACTION MAPPINGS
  // ===========================================
  actionMappings: {
    permissions: {
      'team.members.invite': 'team.members.invite',
      'team.settings.edit':  'team.settings.edit',
      'team.billing.manage': 'team.billing.manage',
    },
    features: {
      'analytics.view':    'analytics',
      'booking.public':    'online_booking',
    },
    limits: {
      'barbers.create':       'barbers',
      'appointments.create':  'appointments_per_month',
    },
  },
}

export default billingConfig
