"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  ensureOwnerBillingAccount,
  getBillingPlanByCode,
  getOwnerBillingAccount,
  getOwnerSubscription,
  recordBillingEvent,
  syncBillingUsageRollup,
  upsertOwnerBillingAccount,
  upsertOwnerSubscription
} from "@/server/billing/billing-service"
import {
  cancelStripeSubscriptionAtPeriodEnd,
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  reactivateStripeSubscription,
  updateStripeSubscriptionPlan
} from "@/server/billing/stripe"
import type { BillingPlanCode, OwnerSubscriptionStatus } from "@/server/database/types"

function mapStripeSubscriptionStatus(status: string | undefined): OwnerSubscriptionStatus {
  if (
    status === "trialing" ||
    status === "active" ||
    status === "past_due" ||
    status === "canceled" ||
    status === "incomplete" ||
    status === "incomplete_expired" ||
    status === "unpaid"
  ) {
    return status
  }

  return "active"
}

function unixToIso(value: number | undefined, fallback: string) {
  if (!value) {
    return fallback
  }

  return new Date(value * 1000).toISOString()
}

function settingsErrorRedirect(code: string): never {
  redirect(`/dashboard/settings?error=${encodeURIComponent(code)}`)
}

async function requireBillingUser() {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  return user
}

export async function changeSubscriptionPlanAction(planCode: BillingPlanCode) {
  const user = await requireBillingUser()

  if (planCode === "free") {
    settingsErrorRedirect("billing_plan_change_unsupported")
  }

  const [account, subscription, plan] = await Promise.all([
    ensureOwnerBillingAccount(user.id),
    getOwnerSubscription(user.id),
    getBillingPlanByCode(planCode)
  ])

  if (
    subscription.stripe_subscription_id &&
    subscription.stripe_subscription_item_id
  ) {
    try {
      const stripeSubscription = await updateStripeSubscriptionPlan({
        planCode: plan.code as Extract<BillingPlanCode, "starter" | "growth" | "scale">,
        stripeSubscriptionId: subscription.stripe_subscription_id,
        stripeSubscriptionItemId: subscription.stripe_subscription_item_id
      })

      await upsertOwnerSubscription({
        cancel_at_period_end: Boolean(stripeSubscription.cancel_at_period_end),
        current_period_end: unixToIso(
          stripeSubscription.current_period_end,
          subscription.current_period_end
        ),
        current_period_start: unixToIso(
          stripeSubscription.current_period_start,
          subscription.current_period_start
        ),
        owner_id: user.id,
        overage_cap_usd: Number(plan.monthly_overage_cap_usd),
        plan_code: plan.code,
        provider: "stripe",
        status: mapStripeSubscriptionStatus(stripeSubscription.status),
        stripe_price_id:
          stripeSubscription.items?.data?.[0]?.price?.id ?? subscription.stripe_price_id,
        stripe_subscription_id: stripeSubscription.id,
        stripe_subscription_item_id:
          stripeSubscription.items?.data?.[0]?.id ?? subscription.stripe_subscription_item_id
      })

      await recordBillingEvent({
        eventType: "subscription.plan_changed",
        ownerId: user.id,
        summary: `Plan changed to ${plan.display_name}.`,
        payload: {
          planCode: plan.code,
          stripeSubscriptionId: stripeSubscription.id
        },
        provider: "stripe"
      })
    } catch {
      settingsErrorRedirect("billing_plan_change_failed")
    }

    await syncBillingUsageRollup(user.id)
    revalidatePath("/dashboard/settings")
    return
  }

  let sessionUrl: string | null = null

  try {
    const session = await createStripeCheckoutSession({
      customerId: account.stripe_customer_id,
      ownerId: user.id,
      planCode: plan.code as Extract<BillingPlanCode, "starter" | "growth" | "scale">
    })

    sessionUrl = session.url ?? null

    if (typeof session.customer === "string") {
      await upsertOwnerBillingAccount({
        ownerId: user.id,
        stripeCustomerId: session.customer
      })
    }

    await upsertOwnerSubscription({
      current_period_end: subscription.current_period_end,
      current_period_start: subscription.current_period_start,
      owner_id: user.id,
      overage_cap_usd: Number(plan.monthly_overage_cap_usd),
      plan_code: subscription.plan_code,
      provider: "stripe",
      status: subscription.status,
      stripe_checkout_session_id: session.id,
      stripe_subscription_id:
        typeof session.subscription === "string"
          ? session.subscription
          : subscription.stripe_subscription_id
    })

    await recordBillingEvent({
      eventType: "checkout.session_created",
      ownerId: user.id,
      summary: `Checkout started for ${plan.display_name}.`,
      payload: {
        checkoutSessionId: session.id,
        planCode: plan.code
      },
      provider: "stripe",
      providerEventId: session.id
    })
  } catch {
    settingsErrorRedirect("billing_checkout_unavailable")
  }

  if (!sessionUrl) {
    settingsErrorRedirect("billing_checkout_unavailable")
  }

  redirect(sessionUrl)
}

export async function openBillingPortalAction() {
  const user = await requireBillingUser()
  const account = await getOwnerBillingAccount(user.id)

  if (!account.stripe_customer_id) {
    settingsErrorRedirect("billing_portal_unavailable")
  }

  const customerId = account.stripe_customer_id

  try {
    const session = await createStripeBillingPortalSession({
      customerId
    })

    if (!session.url) {
      settingsErrorRedirect("billing_portal_unavailable")
    }

    redirect(session.url)
  } catch {
    settingsErrorRedirect("billing_portal_unavailable")
  }
}

export async function cancelSubscriptionAction() {
  const user = await requireBillingUser()
  const subscription = await getOwnerSubscription(user.id)

  if (!subscription.stripe_subscription_id) {
    settingsErrorRedirect("billing_plan_change_unsupported")
  }

  const stripeSubscriptionId = subscription.stripe_subscription_id

  try {
    const stripeSubscription = await cancelStripeSubscriptionAtPeriodEnd({
      stripeSubscriptionId
    })

    await upsertOwnerSubscription({
      cancel_at_period_end: true,
      current_period_end: unixToIso(
        stripeSubscription.current_period_end,
        subscription.current_period_end
      ),
      current_period_start: unixToIso(
        stripeSubscription.current_period_start,
        subscription.current_period_start
      ),
      owner_id: user.id,
      overage_cap_usd: subscription.overage_cap_usd,
      plan_code: subscription.plan_code,
      provider: "stripe",
      status: mapStripeSubscriptionStatus(stripeSubscription.status),
      stripe_price_id:
        stripeSubscription.items?.data?.[0]?.price?.id ?? subscription.stripe_price_id,
      stripe_subscription_id: stripeSubscription.id,
      stripe_subscription_item_id:
        stripeSubscription.items?.data?.[0]?.id ?? subscription.stripe_subscription_item_id
    })

    await recordBillingEvent({
      eventType: "subscription.cancel_at_period_end",
      ownerId: user.id,
      payload: {
        stripeSubscriptionId: stripeSubscription.id
      },
      provider: "stripe",
      summary: "Subscription will cancel at period end."
    })
  } catch {
    settingsErrorRedirect("billing_plan_change_failed")
  }

  revalidatePath("/dashboard/settings")
}

export async function reactivateSubscriptionAction() {
  const user = await requireBillingUser()
  const subscription = await getOwnerSubscription(user.id)

  if (!subscription.stripe_subscription_id) {
    settingsErrorRedirect("billing_plan_change_unsupported")
  }

  const stripeSubscriptionId = subscription.stripe_subscription_id

  try {
    const stripeSubscription = await reactivateStripeSubscription({
      stripeSubscriptionId
    })

    await upsertOwnerSubscription({
      cancel_at_period_end: false,
      current_period_end: unixToIso(
        stripeSubscription.current_period_end,
        subscription.current_period_end
      ),
      current_period_start: unixToIso(
        stripeSubscription.current_period_start,
        subscription.current_period_start
      ),
      owner_id: user.id,
      overage_cap_usd: subscription.overage_cap_usd,
      plan_code: subscription.plan_code,
      provider: "stripe",
      status: mapStripeSubscriptionStatus(stripeSubscription.status),
      stripe_price_id:
        stripeSubscription.items?.data?.[0]?.price?.id ?? subscription.stripe_price_id,
      stripe_subscription_id: stripeSubscription.id,
      stripe_subscription_item_id:
        stripeSubscription.items?.data?.[0]?.id ?? subscription.stripe_subscription_item_id
    })

    await recordBillingEvent({
      eventType: "subscription.reactivated",
      ownerId: user.id,
      payload: {
        stripeSubscriptionId: stripeSubscription.id
      },
      provider: "stripe",
      summary: "Subscription cancellation was removed."
    })
  } catch {
    settingsErrorRedirect("billing_plan_change_failed")
  }

  revalidatePath("/dashboard/settings")
}
