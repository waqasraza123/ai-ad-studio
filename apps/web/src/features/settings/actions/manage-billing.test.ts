import { beforeEach, describe, expect, it, vi } from "vitest"

const redirect = vi.fn((location: string) => {
  const error = new Error("NEXT_REDIRECT") as Error & { location: string }
  error.location = location
  throw error
})

const revalidatePath = vi.fn()
const getAuthenticatedUser = vi.fn()
const ensureOwnerBillingAccount = vi.fn()
const getBillingPlanByCode = vi.fn()
const getOwnerBillingAccount = vi.fn()
const getOwnerSubscription = vi.fn()
const recordBillingEvent = vi.fn()
const syncBillingUsageRollup = vi.fn()
const upsertOwnerBillingAccount = vi.fn()
const upsertOwnerSubscription = vi.fn()
const getBillingPurchaseAvailability = vi.fn()
const cancelStripeSubscriptionAtPeriodEnd = vi.fn()
const createStripeBillingPortalSession = vi.fn()
const createStripeCheckoutSession = vi.fn()
const reactivateStripeSubscription = vi.fn()
const updateStripeSubscriptionPlan = vi.fn()

vi.mock("next/cache", () => ({
  revalidatePath
}))

vi.mock("next/navigation", () => ({
  redirect
}))

vi.mock("@/server/auth/get-authenticated-user", () => ({
  getAuthenticatedUser
}))

vi.mock("@/server/billing/billing-service", () => ({
  ensureOwnerBillingAccount,
  getBillingPlanByCode,
  getOwnerBillingAccount,
  getOwnerSubscription,
  recordBillingEvent,
  syncBillingUsageRollup,
  upsertOwnerBillingAccount,
  upsertOwnerSubscription
}))

vi.mock("@/server/billing/purchase-availability", () => ({
  getBillingPurchaseAvailability
}))

vi.mock("@/server/billing/stripe", () => ({
  cancelStripeSubscriptionAtPeriodEnd,
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  reactivateStripeSubscription,
  updateStripeSubscriptionPlan
}))

async function expectRedirect(
  callback: Promise<unknown>,
  location: string
) {
  await expect(callback).rejects.toMatchObject({ location })
  expect(redirect).toHaveBeenCalledWith(location)
}

describe("manage billing actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    getAuthenticatedUser.mockResolvedValue({ id: "owner_123" })
    ensureOwnerBillingAccount.mockResolvedValue({
      stripe_customer_id: null
    })
    getOwnerBillingAccount.mockResolvedValue({
      stripe_customer_id: "cus_123"
    })
    getOwnerSubscription.mockResolvedValue({
      cancel_at_period_end: false,
      current_period_end: "2026-05-01T00:00:00.000Z",
      current_period_start: "2026-04-01T00:00:00.000Z",
      plan_code: "free",
      status: "free",
      stripe_checkout_session_id: null,
      stripe_price_id: null,
      stripe_subscription_id: null,
      stripe_subscription_item_id: null
    })
    getBillingPlanByCode.mockResolvedValue({
      code: "starter",
      display_name: "Starter",
      monthly_overage_cap_usd: 25
    })
    getBillingPurchaseAvailability.mockResolvedValue({
      checkoutAvailable: true,
      planChangeAvailable: true,
      portalAvailable: true,
      reasonCode: null,
      reasonMessage: null
    })
    createStripeCheckoutSession.mockResolvedValue({
      customer: "cus_123",
      id: "cs_123",
      subscription: "sub_123",
      url: "https://checkout.example.com/session"
    })
    createStripeBillingPortalSession.mockResolvedValue({
      url: "https://billing.example.com/portal"
    })
    updateStripeSubscriptionPlan.mockResolvedValue({
      cancel_at_period_end: false,
      current_period_end: 1_777_600_000,
      current_period_start: 1_775_008_000,
      id: "sub_123",
      items: {
        data: [
          {
            id: "si_123",
            price: {
              id: "price_growth"
            }
          }
        ]
      },
      status: "active"
    })
  })

  it("starts Stripe Checkout for first-time paid purchases", async () => {
    const { changeSubscriptionPlanAction } = await import("./manage-billing")

    await expectRedirect(
      changeSubscriptionPlanAction("starter"),
      "https://checkout.example.com/session"
    )

    expect(createStripeCheckoutSession).toHaveBeenCalledWith({
      customerId: null,
      ownerId: "owner_123",
      planCode: "starter"
    })
    expect(upsertOwnerBillingAccount).toHaveBeenCalledWith({
      ownerId: "owner_123",
      stripeCustomerId: "cus_123"
    })
    expect(recordBillingEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "checkout.session_created",
        ownerId: "owner_123"
      })
    )
  })

  it("uses the Stripe plan-change path for active Stripe subscriptions", async () => {
    getOwnerSubscription.mockResolvedValue({
      cancel_at_period_end: false,
      current_period_end: "2026-05-01T00:00:00.000Z",
      current_period_start: "2026-04-01T00:00:00.000Z",
      plan_code: "starter",
      status: "active",
      stripe_checkout_session_id: null,
      stripe_price_id: "price_starter",
      stripe_subscription_id: "sub_123",
      stripe_subscription_item_id: "si_123"
    })
    getBillingPlanByCode.mockResolvedValue({
      code: "growth",
      display_name: "Growth",
      monthly_overage_cap_usd: 50
    })

    const { changeSubscriptionPlanAction } = await import("./manage-billing")

    await changeSubscriptionPlanAction("growth")

    expect(updateStripeSubscriptionPlan).toHaveBeenCalledWith({
      planCode: "growth",
      stripeSubscriptionId: "sub_123",
      stripeSubscriptionItemId: "si_123"
    })
    expect(createStripeCheckoutSession).not.toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/settings")
  })

  it("fails early when Stripe plan changes are unavailable", async () => {
    getOwnerSubscription.mockResolvedValue({
      cancel_at_period_end: false,
      current_period_end: "2026-05-01T00:00:00.000Z",
      current_period_start: "2026-04-01T00:00:00.000Z",
      plan_code: "starter",
      status: "active",
      stripe_checkout_session_id: null,
      stripe_price_id: "price_starter",
      stripe_subscription_id: "sub_123",
      stripe_subscription_item_id: "si_123"
    })
    getBillingPurchaseAvailability.mockResolvedValue({
      checkoutAvailable: true,
      planChangeAvailable: false,
      portalAvailable: true,
      reasonCode: "billing_plan_change_unavailable",
      reasonMessage: "Stripe price readiness is degraded."
    })

    const { changeSubscriptionPlanAction } = await import("./manage-billing")

    await expectRedirect(
      changeSubscriptionPlanAction("growth"),
      "/dashboard/settings?error=billing_plan_change_unavailable"
    )

    expect(updateStripeSubscriptionPlan).not.toHaveBeenCalled()
    expect(createStripeCheckoutSession).not.toHaveBeenCalled()
  })

  it("fails early when the billing portal is unavailable", async () => {
    getBillingPurchaseAvailability.mockResolvedValue({
      checkoutAvailable: true,
      planChangeAvailable: true,
      portalAvailable: false,
      reasonCode: "billing_portal_unavailable",
      reasonMessage: "Portal is disabled."
    })

    const { openBillingPortalAction } = await import("./manage-billing")

    await expectRedirect(
      openBillingPortalAction(),
      "/dashboard/settings?error=billing_portal_unavailable"
    )

    expect(createStripeBillingPortalSession).not.toHaveBeenCalled()
  })
})
