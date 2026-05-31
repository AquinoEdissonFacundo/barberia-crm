// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated at: 2026-05-31T11:38:05.464Z
// Active theme: barbercrm
// To regenerate: node scripts/build-registry.mjs
//
// This file contains the billing config for the active theme.
// All matrices and metadata are pre-computed at build time.
//
// Query functions: @nextsparkjs/core/lib/billing/queries
// Import from there for planHasFeature, getPlan, etc.

import type { BillingConfig, FeatureDefinition, LimitDefinition, PlanDefinition } from '@nextsparkjs/core/lib/billing/config-types'

// Import only the active theme's billing config
import { billingConfig } from '@/contents/themes/barbercrm/config/billing.config'

// Export the active theme's billing config
export const BILLING_REGISTRY: BillingConfig = billingConfig

// ============================================================================
// PRE-COMPUTED BILLING FEATURES MATRIX (Build-time generated)
// ============================================================================

/**
 * Features matrix type for O(1) lookups
 */
interface FeaturesMatrix {
  /** Feature slug -> Plan slug -> boolean (has feature) */
  features: Record<string, Record<string, boolean>>
  /** Limit slug -> Plan slug -> value (-1 = unlimited) */
  limits: Record<string, Record<string, number>>
}

/**
 * Pre-computed features matrix for O(1) lookups
 * - features[featureSlug][planSlug] = boolean
 * - limits[limitSlug][planSlug] = number (-1 = unlimited)
 */
export const BILLING_MATRIX: FeaturesMatrix = {
  "features": {
    "online_booking": {
      "starter": true,
      "pro": true,
      "business": true
    },
    "analytics": {
      "starter": false,
      "pro": false,
      "business": true
    },
    "priority_support": {
      "starter": false,
      "pro": true,
      "business": true
    }
  },
  "limits": {
    "barbers": {
      "starter": 1,
      "pro": 3,
      "business": -1
    },
    "appointments_per_month": {
      "starter": 100,
      "pro": 300,
      "business": -1
    }
  }
}

// ============================================================================
// PRE-COMPUTED PUBLIC PLANS (Build-time generated)
// ============================================================================

/**
 * Pre-filtered list of public plans for pricing pages
 */
export const PUBLIC_PLANS: readonly PlanDefinition[] = BILLING_REGISTRY.plans.filter(p => p.visibility === 'public')

// ============================================================================
// PRE-COMPUTED METADATA (Build-time generated)
// ============================================================================

/**
 * Billing metadata for the active theme
 */
export const BILLING_METADATA = {
  "totalPlans": 3,
  "publicPlans": 3,
  "totalFeatures": 3,
  "totalLimits": 2,
  "theme": "barbercrm"
} as const

// ============================================================================
// Type Exports
// ============================================================================

export type { BillingConfig, PlanDefinition, FeatureDefinition, LimitDefinition }
