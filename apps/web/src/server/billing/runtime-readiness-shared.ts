import type {
  BillingPlanCode,
  BillingPlanRecord
} from "@/server/database/types"

export type RuntimeStatus = "ok" | "degraded"

export type BillingRuntimeEnvironmentReadiness = {
  billingOperatorSecretConfigured: boolean
  stripeBillingPortalConfigurationConfigured: boolean
  stripeSecretConfigured: boolean
  stripeWebhookSecretConfigured: boolean
}

export type StripePriceReadiness = {
  active: boolean | null
  configured: boolean
  currency: string | null
  error: string | null
  exists: boolean
  interval: string | null
  priceId: string | null
  status: RuntimeStatus
}

export type BillingRuntimeCapabilities = {
  activeSubscriptionPlanChangesAvailable: boolean
  billingPortalAvailable: boolean
  checkoutSessionsAvailable: boolean
  manualSettlementAvailable: boolean
  webhookProcessingAvailable: boolean
}

export type BillingPlanCatalogReadiness = {
  activePlanCodes: BillingPlanCode[]
  error: string | null
  missingPlanCodes: BillingPlanCode[]
  reasonCode: "missing_required_plans" | "query_failed" | "schema_drift" | null
  status: RuntimeStatus
}

export const requiredPlanCodes = ["free", "starter", "growth", "scale"] as const
export const paidPlanCodes = ["starter", "growth", "scale"] as const

export type PaidPlanCode = (typeof paidPlanCodes)[number]

export function buildBillingRuntimeEnvironmentReadiness(
  env: Readonly<Record<string, string | undefined>> = process.env
): BillingRuntimeEnvironmentReadiness {
  return {
    billingOperatorSecretConfigured: Boolean(env.BILLING_OPERATOR_SECRET),
    stripeBillingPortalConfigurationConfigured: Boolean(
      env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID
    ),
    stripeSecretConfigured: Boolean(env.STRIPE_SECRET_KEY),
    stripeWebhookSecretConfigured: Boolean(env.STRIPE_WEBHOOK_SECRET)
  }
}

export function toRuntimeStatus(value: boolean): RuntimeStatus {
  return value ? "ok" : "degraded"
}

export function summarizeBillingPlanCatalog(
  plans: BillingPlanRecord[]
): BillingPlanCatalogReadiness {
  const activePlanCodes = plans.map((plan) => plan.code)
  const missingPlanCodes = requiredPlanCodes.filter(
    (planCode) => !activePlanCodes.includes(planCode)
  )

  return {
    activePlanCodes,
    error: null,
    missingPlanCodes,
    reasonCode: missingPlanCodes.length > 0 ? "missing_required_plans" : null,
    status: toRuntimeStatus(missingPlanCodes.length === 0)
  }
}

export function buildCapabilities(input: {
  env: BillingRuntimeEnvironmentReadiness
  stripeApiReachable: boolean
  stripePrices: Record<PaidPlanCode, StripePriceReadiness>
}): BillingRuntimeCapabilities {
  const activeSubscriptionPlanChangesAvailable = paidPlanCodes.every(
    (planCode) => input.stripePrices[planCode].status === "ok"
  )

  return {
    activeSubscriptionPlanChangesAvailable,
    billingPortalAvailable:
      input.env.stripeSecretConfigured && input.stripeApiReachable,
    checkoutSessionsAvailable:
      input.env.stripeSecretConfigured && input.stripeApiReachable,
    manualSettlementAvailable: input.env.billingOperatorSecretConfigured,
    webhookProcessingAvailable: input.env.stripeWebhookSecretConfigured
  }
}
