import { describe, expect, it } from "vitest"
import type { BillingPlanRecord } from "@/server/database/types"
import {
  buildBillingRuntimeEnvironmentReadiness,
  buildCapabilities,
  summarizeBillingPlanCatalog
} from "./runtime-readiness-shared"

function buildPlanRecord(code: BillingPlanRecord["code"]): BillingPlanRecord {
  return {
    allow_activation_packages: code !== "free",
    allow_creative_performance_analytics: code !== "free",
    allow_creative_performance_ingestion: code !== "free",
    allow_delivery_workspaces: code !== "free",
    allow_external_batch_reviews: code !== "free",
    allow_manual_invoice: code === "scale",
    allow_overage: code !== "free",
    allow_public_showcase: code !== "free",
    allow_share_campaigns: code !== "free",
    allow_share_links: true,
    code,
    concept_run_overage_usd: 0,
    created_at: new Date(0).toISOString(),
    display_name: code,
    included_active_projects: 1,
    included_concept_runs: 1,
    included_final_exports: 1,
    included_preview_generations: 1,
    included_render_batches: 1,
    included_storage_bytes: 1024,
    internal_openai_cost_ceiling_usd: 1,
    internal_runway_cost_ceiling_usd: 1,
    internal_total_cost_ceiling_usd: 1,
    is_active: true,
    max_concurrent_preview_jobs: 1,
    max_concurrent_render_jobs: 1,
    monthly_overage_cap_usd: 0,
    monthly_price_usd: code === "free" ? 0 : 1,
    preview_generation_overage_usd: 0,
    render_batch_overage_usd: 0,
    sort_order: 1,
    storage_gb_month_overage_usd: 0,
    updated_at: new Date(0).toISOString(),
    watermark_exports: code === "free"
  }
}

describe("billing runtime readiness internals", () => {
  it("reads billing environment flags independently", () => {
    expect(
      buildBillingRuntimeEnvironmentReadiness({
        BILLING_OPERATOR_SECRET: "operator-secret",
        STRIPE_SECRET_KEY: "stripe-secret",
        STRIPE_WEBHOOK_SECRET: "webhook-secret"
      })
    ).toEqual({
      billingOperatorSecretConfigured: true,
      stripeBillingPortalConfigurationConfigured: false,
      stripeSecretConfigured: true,
      stripeWebhookSecretConfigured: true
    })
  })

  it("reports missing active plan codes", () => {
    expect(
      summarizeBillingPlanCatalog([
        buildPlanRecord("free"),
        buildPlanRecord("starter")
      ])
    ).toEqual({
      activePlanCodes: ["free", "starter"],
      error: null,
      missingPlanCodes: ["growth", "scale"],
      reasonCode: "missing_required_plans",
      status: "degraded"
    })
  })

  it("marks active subscription plan changes unavailable when any paid price is degraded", () => {
    expect(
      buildCapabilities({
        env: {
          billingOperatorSecretConfigured: true,
          stripeBillingPortalConfigurationConfigured: false,
          stripeSecretConfigured: true,
          stripeWebhookSecretConfigured: true
        },
        stripeApiReachable: true,
        stripePrices: {
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
            active: false,
            configured: true,
            currency: "usd",
            error: "inactive",
            exists: true,
            interval: "month",
            priceId: "price_scale",
            status: "degraded"
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
        }
      })
    ).toEqual({
      activeSubscriptionPlanChangesAvailable: false,
      billingPortalAvailable: true,
      checkoutSessionsAvailable: true,
      manualSettlementAvailable: true,
      webhookProcessingAvailable: true
    })
  })
})
