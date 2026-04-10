import "server-only"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { getServerEnvironment } from "@/lib/env"
import { isBillingPlanCatalogError } from "@/server/billing/billing-plan-catalog"
import { listBillingPlans } from "@/server/billing/billing-service"
import {
  buildBillingRuntimeEnvironmentReadiness,
  buildCapabilities,
  paidPlanCodes,
  requiredPlanCodes,
  summarizeBillingPlanCatalog,
  toRuntimeStatus,
  type BillingPlanCatalogReadiness,
  type BillingRuntimeCapabilities,
  type BillingRuntimeEnvironmentReadiness,
  type PaidPlanCode,
  type RuntimeStatus,
  type StripePriceReadiness
} from "@/server/billing/runtime-readiness-shared"
import {
  checkStripeApiConnectivity,
  retrieveStripePrice
} from "@/server/billing/stripe"

export type BillingRuntimeDiagnostics = {
  capabilities: BillingRuntimeCapabilities
  checkedAt: string
  env: BillingRuntimeEnvironmentReadiness
  issues: string[]
  planCatalog: BillingPlanCatalogReadiness
  status: RuntimeStatus
  stripe: {
    apiReachable: boolean
    error: string | null
    prices: Record<PaidPlanCode, StripePriceReadiness>
    status: RuntimeStatus
  }
}

function buildInitialStripePriceReadiness(
  priceId: string | undefined
): StripePriceReadiness {
  const configured = Boolean(priceId)

  return {
    active: null,
    configured,
    currency: null,
    error: configured ? null : "Stripe price id is not configured.",
    exists: false,
    interval: null,
    priceId: priceId ?? null,
    status: configured ? "degraded" : "degraded"
  }
}

function deriveIssues(input: {
  capabilities: BillingRuntimeCapabilities
  env: BillingRuntimeEnvironmentReadiness
  planCatalog: BillingPlanCatalogReadiness
  stripe: BillingRuntimeDiagnostics["stripe"]
}) {
  const issues: string[] = []

  if (!input.env.stripeSecretConfigured) {
    issues.push("STRIPE_SECRET_KEY is not configured.")
  }

  if (!input.capabilities.webhookProcessingAvailable) {
    issues.push("STRIPE_WEBHOOK_SECRET is not configured.")
  }

  if (!input.env.billingOperatorSecretConfigured) {
    issues.push("BILLING_OPERATOR_SECRET is not configured.")
  }

  if (input.planCatalog.missingPlanCodes.length > 0) {
    issues.push(
      `Missing active billing plans: ${input.planCatalog.missingPlanCodes.join(", ")}.`
    )
  }

  if (input.planCatalog.error) {
    issues.push(input.planCatalog.error)
  }

  if (!input.stripe.apiReachable) {
    issues.push(
      input.stripe.error ?? "Stripe API connectivity could not be verified."
    )
  }

  for (const planCode of paidPlanCodes) {
    const price = input.stripe.prices[planCode]

    if (price.status !== "ok") {
      issues.push(
        price.error ??
          `Stripe price readiness is degraded for the ${planCode} plan.`
      )
    }
  }

  return issues
}

export async function getBillingPlanCatalogReadiness(): Promise<BillingPlanCatalogReadiness> {
  try {
    const plans = await listBillingPlans(createSupabaseAdminClient())
    return summarizeBillingPlanCatalog(plans)
  } catch (error) {
    return {
      activePlanCodes: [],
      error:
        error instanceof Error
          ? error.message
          : "Billing plan catalog could not be loaded.",
      missingPlanCodes: [...requiredPlanCodes],
      reasonCode: isBillingPlanCatalogError(error) ? error.code : "query_failed",
      status: "degraded"
    }
  }
}

export async function getBillingRuntimeDiagnostics(): Promise<BillingRuntimeDiagnostics> {
  const environment = getServerEnvironment()
  const env = buildBillingRuntimeEnvironmentReadiness(process.env)
  const stripePrices: Record<PaidPlanCode, StripePriceReadiness> = {
    growth: buildInitialStripePriceReadiness(
      environment.STRIPE_PRICE_GROWTH_MONTHLY
    ),
    scale: buildInitialStripePriceReadiness(
      environment.STRIPE_PRICE_SCALE_MONTHLY
    ),
    starter: buildInitialStripePriceReadiness(
      environment.STRIPE_PRICE_STARTER_MONTHLY
    )
  }

  let stripeApiReachable = false
  let stripeError: string | null = null

  if (env.stripeSecretConfigured) {
    try {
      stripeApiReachable = await checkStripeApiConnectivity()
    } catch (error) {
      stripeError =
        error instanceof Error ? error.message : "Stripe API request failed."
    }
  }

  if (stripeApiReachable) {
    for (const planCode of paidPlanCodes) {
      const current = stripePrices[planCode]

      if (!current.priceId) {
        continue
      }

      try {
        const price = await retrieveStripePrice(current.priceId)
        const validRecurringMonthlyPrice =
          price.type === "recurring" && price.recurring?.interval === "month"

        stripePrices[planCode] = {
          active: price.active ?? null,
          configured: true,
          currency: price.currency ?? null,
          error:
            price.active === false
              ? `Stripe price ${current.priceId} for ${planCode} is inactive.`
              : !validRecurringMonthlyPrice
                ? `Stripe price ${current.priceId} for ${planCode} is not a monthly recurring price.`
                : null,
          exists: true,
          interval: price.recurring?.interval ?? null,
          priceId: current.priceId,
          status: toRuntimeStatus(
            price.active !== false && validRecurringMonthlyPrice
          )
        }
      } catch (error) {
        stripePrices[planCode] = {
          ...current,
          error:
            error instanceof Error
              ? error.message
              : `Failed to load Stripe price ${current.priceId}.`,
          status: "degraded"
        }
      }
    }
  }

  const planCatalog = await getBillingPlanCatalogReadiness()

  const stripe = {
    apiReachable: stripeApiReachable,
    error: stripeError,
    prices: stripePrices,
    status: toRuntimeStatus(
      stripeApiReachable &&
        paidPlanCodes.every(
          (planCode) => stripePrices[planCode].status === "ok"
        )
    )
  } satisfies BillingRuntimeDiagnostics["stripe"]

  const capabilities = buildCapabilities({
    env,
    stripeApiReachable,
    stripePrices
  })
  const issues = deriveIssues({
    capabilities,
    env,
    planCatalog,
    stripe
  })

  return {
    capabilities,
    checkedAt: new Date().toISOString(),
    env,
    issues,
    planCatalog,
    status: toRuntimeStatus(
      planCatalog.status === "ok" &&
        stripe.status === "ok" &&
        capabilities.webhookProcessingAvailable
    ),
    stripe
  }
}

export const billingRuntimeReadinessInternals = {
  buildBillingRuntimeEnvironmentReadiness,
  buildCapabilities,
  getBillingPlanCatalogReadiness,
  summarizeBillingPlanCatalog
}
