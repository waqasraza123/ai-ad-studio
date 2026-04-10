import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { getMessages } from "@/lib/i18n/catalog"
import { createTranslator } from "@/lib/i18n/translator"
import type {
  BillingEventRecord,
  BillingPlanRecord,
  EffectiveOwnerLimits
} from "@/server/database/types"
import { BillingPlanPanel } from "./billing-plan-panel"

vi.mock("@/features/settings/actions/manage-billing", () => ({
  cancelSubscriptionAction: vi.fn(),
  changeSubscriptionPlanAction: vi.fn(),
  openBillingPortalAction: vi.fn(),
  reactivateSubscriptionAction: vi.fn()
}))

vi.mock("@/lib/i18n/server", () => ({
  getServerI18n: async () => {
    const locale = "en" as const
    const messages = getMessages(locale)
    return createTranslator(locale, messages)
  }
}))

vi.mock("@/server/billing/billing-service", () => ({
  formatStorage: (value: number) => `${value} bytes`
}))

function buildPlan(
  code: BillingPlanRecord["code"],
  overrides: Partial<BillingPlanRecord> = {}
): BillingPlanRecord {
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
    display_name:
      code === "free"
        ? "Free"
        : code === "starter"
          ? "Starter"
          : code === "growth"
            ? "Growth"
            : "Scale",
    included_active_projects: 1,
    included_concept_runs: 10,
    included_final_exports: 10,
    included_preview_generations: 10,
    included_render_batches: 10,
    included_storage_bytes: 1024,
    internal_openai_cost_ceiling_usd: 100,
    internal_runway_cost_ceiling_usd: 100,
    internal_total_cost_ceiling_usd: 100,
    is_active: true,
    max_concurrent_preview_jobs: 1,
    max_concurrent_render_jobs: 1,
    monthly_overage_cap_usd: 50,
    monthly_price_usd: code === "free" ? 0 : code === "starter" ? 29 : code === "growth" ? 79 : 199,
    preview_generation_overage_usd: 0,
    render_batch_overage_usd: 0,
    sort_order: code === "free" ? 1 : code === "starter" ? 2 : code === "growth" ? 3 : 4,
    storage_gb_month_overage_usd: 0,
    updated_at: new Date(0).toISOString(),
    watermark_exports: code === "free",
    ...overrides
  }
}

function buildLimits(
  planCode: BillingPlanRecord["code"],
  overrides: Partial<EffectiveOwnerLimits> = {}
): EffectiveOwnerLimits {
  const plan = buildPlan(planCode)

  return {
    billingAccount: null,
    budgets: {
      autoBlockOnBudget: true,
      monthlyOpenaiBudgetUsd: 100,
      monthlyOverageCapUsd: 50,
      monthlyRunwayBudgetUsd: 100,
      monthlyTotalBudgetUsd: 200,
      projectedOverageUsd: 0,
      providerCostUsd: 0
    },
    featureAccess: {
      allowActivationPackages: plan.allow_activation_packages,
      allowCreativePerformanceAnalytics:
        plan.allow_creative_performance_analytics,
      allowCreativePerformanceIngestion:
        plan.allow_creative_performance_ingestion,
      allowDeliveryWorkspaces: plan.allow_delivery_workspaces,
      allowExternalBatchReviews: plan.allow_external_batch_reviews,
      allowManualInvoice: plan.allow_manual_invoice,
      allowPublicShowcase: plan.allow_public_showcase,
      allowShareCampaigns: plan.allow_share_campaigns,
      allowShareLinks: plan.allow_share_links,
      watermarkExports: plan.watermark_exports
    },
    generationBlocked: false,
    generationBlockReason: null,
    guardrails: {
      auto_block_on_budget: true,
      created_at: new Date(0).toISOString(),
      monthly_openai_budget_usd: 100,
      monthly_runway_budget_usd: 100,
      monthly_total_budget_usd: 200,
      max_concurrent_preview_jobs: 2,
      max_concurrent_render_jobs: 2,
      owner_id: "owner_123",
      updated_at: new Date(0).toISOString()
    },
    hardCaps: {
      activeProjects: plan.included_active_projects,
      conceptRuns: plan.included_concept_runs,
      concurrentPreviewJobs: plan.max_concurrent_preview_jobs,
      concurrentRenderJobs: plan.max_concurrent_render_jobs,
      finalExports: plan.included_final_exports,
      previewGenerations: plan.included_preview_generations,
      renderBatches: plan.included_render_batches,
      storageBytes: plan.included_storage_bytes
    },
    plan,
    subscription: {
      cancel_at_period_end: false,
      cancelled_at: null,
      created_at: new Date(0).toISOString(),
      current_period_end: "2026-05-01T00:00:00.000Z",
      current_period_start: "2026-04-01T00:00:00.000Z",
      downgrade_to_plan_code: null,
      grace_period_ends_at: null,
      id: "sub_123",
      manual_payment_reference: null,
      metadata: {},
      overage_cap_usd: 50,
      owner_id: "owner_123",
      payment_failed_at: null,
      plan_code: plan.code,
      provider: "stripe",
      status: plan.code === "free" ? "free" : "active",
      stripe_checkout_session_id: null,
      stripe_price_id: plan.code === "free" ? null : `price_${plan.code}`,
      stripe_subscription_id: null,
      stripe_subscription_item_id: null,
      updated_at: new Date(0).toISOString()
    },
    usage: {
      active_projects_used: 0,
      concept_runs_used: 0,
      created_at: new Date(0).toISOString(),
      final_exports_used: 0,
      id: "usage_123",
      owner_id: "owner_123",
      period_end: "2026-05-01T00:00:00.000Z",
      period_start: "2026-04-01T00:00:00.000Z",
      plan_code: plan.code,
      preview_generations_used: 0,
      projected_overage_usd: 0,
      provider_cost_usd: 0,
      render_batches_used: 0,
      storage_bytes_used: 0,
      updated_at: new Date(0).toISOString()
    },
    ...overrides
  }
}

const billingPlans = [
  buildPlan("free"),
  buildPlan("starter"),
  buildPlan("growth"),
  buildPlan("scale")
]

const billingEvents: BillingEventRecord[] = []

describe("BillingPlanPanel", () => {
  it("renders paid non-current plans as full-card submit buttons", async () => {
    const ui = await BillingPlanPanel({
      billingEvents,
      billingPlans,
      limits: buildLimits("free"),
      purchaseAvailability: {
        checkoutAvailable: true,
        planChangeAvailable: true,
        portalAvailable: true,
        reasonCode: null,
        reasonMessage: null
      }
    })

    const { container } = render(ui)

    expect(container.querySelectorAll("form")).toHaveLength(3)
    expect(screen.getByRole("button", { name: /Choose Starter/i })).toBeEnabled()
    expect(screen.getByRole("button", { name: /Choose Growth/i })).toBeEnabled()
    expect(screen.getByRole("button", { name: /Choose Scale/i })).toBeEnabled()
  })

  it("keeps the current plan and free fallback card non-actionable", async () => {
    const ui = await BillingPlanPanel({
      billingEvents,
      billingPlans,
      limits: buildLimits("starter"),
      purchaseAvailability: {
        checkoutAvailable: true,
        planChangeAvailable: true,
        portalAvailable: true,
        reasonCode: null,
        reasonMessage: null
      }
    })

    const { container } = render(ui)

    expect(container.querySelectorAll("form")).toHaveLength(2)
    expect(screen.queryByRole("button", { name: /Choose Free/i })).toBeNull()
    expect(screen.getByText("Current")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Return to Free by canceling the paid subscription at period end."
      )
    ).toBeInTheDocument()
  })

  it("disables paid plan purchase surfaces when checkout is unavailable", async () => {
    const ui = await BillingPlanPanel({
      billingEvents,
      billingPlans,
      limits: buildLimits("free"),
      purchaseAvailability: {
        checkoutAvailable: false,
        planChangeAvailable: true,
        portalAvailable: true,
        reasonCode: "billing_checkout_unavailable",
        reasonMessage: "Checkout is unavailable."
      }
    })

    render(ui)

    expect(
      screen.getAllByText(
        "Paid plan checkout is unavailable right now. Check Stripe billing runtime and try again."
      ).length
    ).toBeGreaterThan(0)
    expect(screen.getByRole("button", { name: /Choose Starter/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /Choose Growth/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /Choose Scale/i })).toBeDisabled()
  })

  it("disables portal controls when the billing portal is unavailable", async () => {
    const ui = await BillingPlanPanel({
      billingEvents,
      billingPlans,
      limits: buildLimits("starter", {
        billingAccount: {
          billing_country: "US",
          checkout_preference: "card_or_crypto",
          created_at: new Date(0).toISOString(),
          manual_invoice_allowed: false,
          owner_id: "owner_123",
          stablecoin_eligible: true,
          stripe_customer_id: "cus_123",
          stripe_default_payment_method_id: null,
          tax_exempt: false,
          updated_at: new Date(0).toISOString()
        }
      }),
      purchaseAvailability: {
        checkoutAvailable: true,
        planChangeAvailable: true,
        portalAvailable: false,
        reasonCode: "billing_portal_unavailable",
        reasonMessage: "Portal is unavailable."
      }
    })

    render(ui)

    expect(
      screen.getByText(
        "Billing portal actions are unavailable right now. Check Stripe billing runtime and try again."
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Manage payment method" })
    ).toBeDisabled()
  })
})
