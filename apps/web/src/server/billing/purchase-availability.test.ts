import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import { billingPurchaseAvailabilityInternals } from "./purchase-availability"

describe("billing purchase availability", () => {
  it("maps runtime diagnostics into available checkout, plan change, and portal actions", () => {
    expect(
      billingPurchaseAvailabilityInternals.toBillingPurchaseAvailability({
        capabilities: {
          activeSubscriptionPlanChangesAvailable: true,
          billingPortalAvailable: true,
          checkoutSessionsAvailable: true,
          manualSettlementAvailable: true,
          webhookProcessingAvailable: true
        },
        checkedAt: new Date(0).toISOString(),
        env: {
          billingOperatorSecretConfigured: true,
          stripeBillingPortalConfigurationConfigured: true,
          stripeSecretConfigured: true,
          stripeWebhookSecretConfigured: true
        },
        issues: [],
        planCatalog: {
          activePlanCodes: ["free", "starter", "growth", "scale"],
          error: null,
          missingPlanCodes: [],
          reasonCode: null,
          status: "ok"
        },
        status: "ok",
        stripe: {
          apiReachable: true,
          error: null,
          prices: {
            growth: {
              active: true,
              configured: true,
              currency: "usd",
              error: null,
              exists: true,
              interval: "month",
              priceId: "price_growth",
              status: "ok"
            },
            scale: {
              active: true,
              configured: true,
              currency: "usd",
              error: null,
              exists: true,
              interval: "month",
              priceId: "price_scale",
              status: "ok"
            },
            starter: {
              active: true,
              configured: true,
              currency: "usd",
              error: null,
              exists: true,
              interval: "month",
              priceId: "price_starter",
              status: "ok"
            }
          },
          status: "ok"
        }
      })
    ).toEqual({
      checkoutAvailable: true,
      planChangeAvailable: true,
      portalAvailable: true,
      reasonCode: null,
      reasonMessage: null
    })
  })

  it("prefers checkout as the user-facing failure reason when checkout is unavailable", () => {
    expect(
      billingPurchaseAvailabilityInternals.toBillingPurchaseAvailability({
        capabilities: {
          activeSubscriptionPlanChangesAvailable: false,
          billingPortalAvailable: false,
          checkoutSessionsAvailable: false,
          manualSettlementAvailable: false,
          webhookProcessingAvailable: false
        },
        checkedAt: new Date(0).toISOString(),
        env: {
          billingOperatorSecretConfigured: false,
          stripeBillingPortalConfigurationConfigured: false,
          stripeSecretConfigured: false,
          stripeWebhookSecretConfigured: false
        },
        issues: ["STRIPE_SECRET_KEY is not configured."],
        planCatalog: {
          activePlanCodes: ["free"],
          error: null,
          missingPlanCodes: ["starter", "growth", "scale"],
          reasonCode: "missing_required_plans",
          status: "degraded"
        },
        status: "degraded",
        stripe: {
          apiReachable: false,
          error: "unreachable",
          prices: {
            growth: {
              active: null,
              configured: false,
              currency: null,
              error: "missing",
              exists: false,
              interval: null,
              priceId: null,
              status: "degraded"
            },
            scale: {
              active: null,
              configured: false,
              currency: null,
              error: "missing",
              exists: false,
              interval: null,
              priceId: null,
              status: "degraded"
            },
            starter: {
              active: null,
              configured: false,
              currency: null,
              error: "missing",
              exists: false,
              interval: null,
              priceId: null,
              status: "degraded"
            }
          },
          status: "degraded"
        }
      })
    ).toEqual({
      checkoutAvailable: false,
      planChangeAvailable: false,
      portalAvailable: false,
      reasonCode: "billing_checkout_unavailable",
      reasonMessage: "STRIPE_SECRET_KEY is not configured."
    })
  })
})
