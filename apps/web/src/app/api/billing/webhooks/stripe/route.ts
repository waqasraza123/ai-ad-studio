import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import {
  getBillingPlanByCode,
  getOwnerSubscription,
  recordBillingEvent,
  syncBillingUsageRollup,
  upsertOwnerBillingAccount,
  upsertOwnerSubscription
} from "@/server/billing/billing-service"
import { verifyStripeWebhookSignature } from "@/server/billing/stripe"
import type { BillingPlanCode } from "@/server/database/types"

type StripeEvent = {
  created?: number
  data?: {
    object?: Record<string, unknown>
  }
  id?: string
  type?: string
}

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {}
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null
}

function readPlanCode(value: unknown): BillingPlanCode | null {
  return value === "free" ||
    value === "starter" ||
    value === "growth" ||
    value === "scale"
    ? value
    : null
}

function derivePlanCodeFromPriceId(priceId: string | null): BillingPlanCode | null {
  if (!priceId) {
    return null
  }

  if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY) {
    return "starter"
  }

  if (priceId === process.env.STRIPE_PRICE_GROWTH_MONTHLY) {
    return "growth"
  }

  if (priceId === process.env.STRIPE_PRICE_SCALE_MONTHLY) {
    return "scale"
  }

  return null
}

async function lookupOwnerIdByCustomerId(customerId: string | null) {
  if (!customerId) {
    return null
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("owner_billing_accounts")
    .select("owner_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to look up billing account by customer id")
  }

  return readString(data?.owner_id)
}

async function lookupOwnerIdBySubscriptionId(subscriptionId: string | null) {
  if (!subscriptionId) {
    return null
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("owner_subscriptions")
    .select("owner_id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to look up owner subscription by stripe id")
  }

  return readString(data?.owner_id)
}

async function handleCheckoutCompleted(event: StripeEvent) {
  const object = asRecord(event.data?.object)
  const metadata = asRecord(object.metadata)
  const ownerId =
    readString(metadata.ownerId) ?? (await lookupOwnerIdByCustomerId(readString(object.customer)))
  const planCode = readPlanCode(metadata.planCode)

  if (!ownerId || !planCode) {
    return
  }

  const plan = await getBillingPlanByCode(planCode)

  await upsertOwnerBillingAccount(
    {
      ownerId,
      stripeCustomerId: readString(object.customer)
    },
    createSupabaseAdminClient()
  )

  const currentSubscription = await getOwnerSubscription(
    ownerId,
    createSupabaseAdminClient()
  )

  await upsertOwnerSubscription(
    {
      current_period_end: currentSubscription.current_period_end,
      current_period_start: currentSubscription.current_period_start,
      owner_id: ownerId,
      overage_cap_usd: Number(plan.monthly_overage_cap_usd),
      plan_code: planCode,
      provider: "stripe",
      status: "active",
      stripe_checkout_session_id: readString(object.id),
      stripe_subscription_id: readString(object.subscription)
    },
    createSupabaseAdminClient()
  )

  await recordBillingEvent(
    {
      eventOccurredAt: event.created
        ? new Date(event.created * 1000).toISOString()
        : undefined,
      eventType: event.type ?? "checkout.session.completed",
      ownerId,
      payload: object,
      provider: "stripe",
      providerEventId: readString(object.id) ?? readString(event.id),
      summary: `Checkout completed for ${plan.display_name}.`
    },
    createSupabaseAdminClient()
  )
}

async function handleSubscriptionChanged(event: StripeEvent) {
  const object = asRecord(event.data?.object)
  const metadata = asRecord(object.metadata)
  const items = asRecord(object.items)
  const itemList = Array.isArray(items.data) ? items.data.map(asRecord) : []
  const firstItem = itemList[0] ?? {}
  const price = asRecord(firstItem.price)
  const priceId = readString(price.id)
  const subscriptionId = readString(object.id)
  const customerId = readString(object.customer)
  const ownerId =
    readString(metadata.ownerId) ??
    (await lookupOwnerIdBySubscriptionId(subscriptionId)) ??
    (await lookupOwnerIdByCustomerId(customerId))
  const planCode =
    readPlanCode(metadata.planCode) ??
    derivePlanCodeFromPriceId(priceId) ??
    "free"

  if (!ownerId) {
    return
  }

  const plan = await getBillingPlanByCode(planCode)

  await upsertOwnerBillingAccount(
    {
      ownerId,
      stripeCustomerId: customerId,
      stripeDefaultPaymentMethodId: readString(object.default_payment_method)
    },
    createSupabaseAdminClient()
  )

  await upsertOwnerSubscription(
    {
      cancel_at_period_end: object.cancel_at_period_end === true,
      current_period_end: new Date(
        Number(object.current_period_end ?? Date.now() / 1000) * 1000
      ).toISOString(),
      current_period_start: new Date(
        Number(object.current_period_start ?? Date.now() / 1000) * 1000
      ).toISOString(),
      owner_id: ownerId,
      overage_cap_usd: Number(plan.monthly_overage_cap_usd),
      plan_code: planCode,
      provider: "stripe",
      status:
        event.type === "customer.subscription.deleted"
          ? "canceled"
          : (readString(object.status) as
              | "free"
              | "trialing"
              | "active"
              | "past_due"
              | "grace_period"
              | "canceled"
              | "incomplete"
              | "incomplete_expired"
              | "unpaid") ?? "active",
      stripe_price_id: priceId,
      stripe_subscription_id: subscriptionId,
      stripe_subscription_item_id: readString(firstItem.id)
    },
    createSupabaseAdminClient()
  )

  await recordBillingEvent(
    {
      eventOccurredAt: event.created
        ? new Date(event.created * 1000).toISOString()
        : undefined,
      eventType: event.type ?? "customer.subscription.updated",
      ownerId,
      payload: object,
      provider: "stripe",
      providerEventId: readString(event.id) ?? subscriptionId,
      summary: `Subscription reconciled for ${plan.display_name}.`
    },
    createSupabaseAdminClient()
  )

  await syncBillingUsageRollup(ownerId, createSupabaseAdminClient())
}

async function handleInvoicePaid(event: StripeEvent) {
  const object = asRecord(event.data?.object)
  const subscriptionId = readString(object.subscription)
  const customerId = readString(object.customer)
  const ownerId =
    (await lookupOwnerIdBySubscriptionId(subscriptionId)) ??
    (await lookupOwnerIdByCustomerId(customerId))

  if (!ownerId) {
    return
  }

  const subscription = await getOwnerSubscription(
    ownerId,
    createSupabaseAdminClient()
  )

  await upsertOwnerSubscription(
    {
      ...subscription,
      current_period_end: subscription.current_period_end,
      current_period_start: subscription.current_period_start,
      grace_period_ends_at: null,
      owner_id: ownerId,
      payment_failed_at: null,
      status: "active"
    },
    createSupabaseAdminClient()
  )

  await recordBillingEvent(
    {
      eventOccurredAt: event.created
        ? new Date(event.created * 1000).toISOString()
        : undefined,
      eventType: event.type ?? "invoice.paid",
      ownerId,
      payload: object,
      provider: "stripe",
      providerEventId: readString(event.id) ?? readString(object.id),
      summary: "Invoice paid."
    },
    createSupabaseAdminClient()
  )
}

async function handleInvoicePaymentFailed(event: StripeEvent) {
  const object = asRecord(event.data?.object)
  const subscriptionId = readString(object.subscription)
  const customerId = readString(object.customer)
  const ownerId =
    (await lookupOwnerIdBySubscriptionId(subscriptionId)) ??
    (await lookupOwnerIdByCustomerId(customerId))

  if (!ownerId) {
    return
  }

  const subscription = await getOwnerSubscription(
    ownerId,
    createSupabaseAdminClient()
  )
  const gracePeriodEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()

  await upsertOwnerSubscription(
    {
      ...subscription,
      current_period_end: subscription.current_period_end,
      current_period_start: subscription.current_period_start,
      grace_period_ends_at: gracePeriodEndsAt,
      owner_id: ownerId,
      payment_failed_at: new Date().toISOString(),
      status: "grace_period"
    },
    createSupabaseAdminClient()
  )

  await recordBillingEvent(
    {
      eventOccurredAt: event.created
        ? new Date(event.created * 1000).toISOString()
        : undefined,
      eventType: event.type ?? "invoice.payment_failed",
      ownerId,
      payload: object,
      provider: "stripe",
      providerEventId: readString(event.id) ?? readString(object.id),
      summary: "Invoice payment failed. Grace period started."
    },
    createSupabaseAdminClient()
  )
}

export async function POST(request: Request) {
  const payload = await request.text()

  try {
    verifyStripeWebhookSignature({
      payload,
      signatureHeader: request.headers.get("stripe-signature")
    })
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Invalid signature"
      },
      {
        status: 400
      }
    )
  }

  const event = JSON.parse(payload) as StripeEvent

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event)
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await handleSubscriptionChanged(event)
    } else if (event.type === "invoice.paid") {
      await handleInvoicePaid(event)
    } else if (event.type === "invoice.payment_failed") {
      await handleInvoicePaymentFailed(event)
    } else {
      await recordBillingEvent(
        {
          eventOccurredAt: event.created
            ? new Date(event.created * 1000).toISOString()
            : undefined,
          eventStatus: "ignored",
          eventType: event.type ?? "unknown",
          payload: asRecord(event.data?.object),
          provider: "stripe",
          providerEventId: readString(event.id),
          summary: "Stripe event ignored."
        },
        createSupabaseAdminClient()
      )
    }
  } catch (error) {
    await recordBillingEvent(
      {
        eventOccurredAt: event.created
          ? new Date(event.created * 1000).toISOString()
          : undefined,
        eventStatus: "failed",
        eventType: event.type ?? "unknown",
        payload: {
          error: error instanceof Error ? error.message : "Unknown error",
          event: asRecord(event.data?.object)
        },
        provider: "stripe",
        providerEventId: readString(event.id),
        summary: "Stripe event processing failed."
      },
      createSupabaseAdminClient()
    )

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Webhook processing failed"
      },
      {
        status: 500
      }
    )
  }

  return Response.json({
    received: true
  })
}
