import { createHmac, timingSafeEqual } from "node:crypto"
import { getPublicEnvironment, getServerEnvironment } from "@/lib/env"
import type { BillingPlanCode } from "@/server/database/types"

type StripeRequestMethod = "GET" | "POST"

type StripeSubscriptionShape = {
  id: string
  cancel_at_period_end?: boolean
  current_period_end?: number
  current_period_start?: number
  customer?: string
  default_payment_method?: string | null
  items?: {
    data?: Array<{
      id: string
      price?: {
        id?: string | null
      } | null
    }>
  } | null
  metadata?: Record<string, string>
  status?: string
}

function getStripeServerEnvironment() {
  const environment = getServerEnvironment()

  if (!environment.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is required for billing operations")
  }

  return environment
}

function buildPlanPriceId(planCode: BillingPlanCode) {
  const environment = getServerEnvironment()

  if (planCode === "starter") {
    return environment.STRIPE_PRICE_STARTER_MONTHLY ?? null
  }

  if (planCode === "growth") {
    return environment.STRIPE_PRICE_GROWTH_MONTHLY ?? null
  }

  if (planCode === "scale") {
    return environment.STRIPE_PRICE_SCALE_MONTHLY ?? null
  }

  return null
}

function buildPlanName(planCode: BillingPlanCode) {
  if (planCode === "starter") {
    return "AI Ad Studio Starter"
  }

  if (planCode === "growth") {
    return "AI Ad Studio Growth"
  }

  if (planCode === "scale") {
    return "AI Ad Studio Scale"
  }

  return "AI Ad Studio Free"
}

function buildPlanPriceUsd(planCode: BillingPlanCode) {
  if (planCode === "starter") {
    return 39
  }

  if (planCode === "growth") {
    return 99
  }

  if (planCode === "scale") {
    return 299
  }

  return 0
}

async function stripeRequest<T>(
  path: string,
  input?: {
    body?: URLSearchParams
    method?: StripeRequestMethod
  }
) {
  const environment = getStripeServerEnvironment()
  const method = input?.body ? "POST" : input?.method ?? "GET"
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    body: input?.body?.toString(),
    headers: {
      Authorization: `Bearer ${environment.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method
  })

  const data = (await response.json()) as T & {
    error?: {
      message?: string
    }
  }

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Stripe request failed: ${path}`)
  }

  return data
}

export async function createStripeCheckoutSession(input: {
  customerId?: string | null
  ownerId: string
  planCode: Extract<BillingPlanCode, "starter" | "growth" | "scale">
}) {
  const publicEnvironment = getPublicEnvironment()
  const params = new URLSearchParams()
  const priceId = buildPlanPriceId(input.planCode)

  params.set("mode", "subscription")
  params.set("success_url", `${publicEnvironment.NEXT_PUBLIC_APP_URL}/dashboard/settings?billing=success`)
  params.set("cancel_url", `${publicEnvironment.NEXT_PUBLIC_APP_URL}/dashboard/settings?billing=cancelled`)
  params.append("payment_method_types[]", "card")
  params.append("payment_method_types[]", "crypto")
  params.set("metadata[ownerId]", input.ownerId)
  params.set("metadata[planCode]", input.planCode)
  params.set("subscription_data[metadata][ownerId]", input.ownerId)
  params.set("subscription_data[metadata][planCode]", input.planCode)

  if (input.customerId) {
    params.set("customer", input.customerId)
  }

  if (priceId) {
    params.set("line_items[0][price]", priceId)
  } else {
    params.set("line_items[0][price_data][currency]", "usd")
    params.set("line_items[0][price_data][product_data][name]", buildPlanName(input.planCode))
    params.set(
      "line_items[0][price_data][unit_amount]",
      String(buildPlanPriceUsd(input.planCode) * 100)
    )
    params.set("line_items[0][price_data][recurring][interval]", "month")
  }

  params.set("line_items[0][quantity]", "1")

  return stripeRequest<{
    customer?: string | null
    id: string
    subscription?: string | null
    url?: string | null
  }>("checkout/sessions", {
    body: params
  })
}

export async function createStripeBillingPortalSession(input: {
  customerId: string
}) {
  const publicEnvironment = getPublicEnvironment()
  const environment = getServerEnvironment()
  const params = new URLSearchParams()

  params.set("customer", input.customerId)
  params.set(
    "return_url",
    `${publicEnvironment.NEXT_PUBLIC_APP_URL}/dashboard/settings?billing=portal`
  )

  if (environment.STRIPE_BILLING_PORTAL_CONFIGURATION_ID) {
    params.set(
      "configuration",
      environment.STRIPE_BILLING_PORTAL_CONFIGURATION_ID
    )
  }

  return stripeRequest<{
    id: string
    url?: string | null
  }>("billing_portal/sessions", {
    body: params
  })
}

export async function updateStripeSubscriptionPlan(input: {
  planCode: Extract<BillingPlanCode, "starter" | "growth" | "scale">
  stripeSubscriptionId: string
  stripeSubscriptionItemId: string
}) {
  const priceId = buildPlanPriceId(input.planCode)

  if (!priceId) {
    throw new Error("A Stripe price id is required to change plans on an active subscription")
  }

  const params = new URLSearchParams()
  params.set("items[0][id]", input.stripeSubscriptionItemId)
  params.set("items[0][price]", priceId)
  params.set("proration_behavior", "create_prorations")

  return stripeRequest<StripeSubscriptionShape>(
    `subscriptions/${input.stripeSubscriptionId}`,
    {
      body: params
    }
  )
}

export async function cancelStripeSubscriptionAtPeriodEnd(input: {
  stripeSubscriptionId: string
}) {
  const params = new URLSearchParams()
  params.set("cancel_at_period_end", "true")

  return stripeRequest<StripeSubscriptionShape>(
    `subscriptions/${input.stripeSubscriptionId}`,
    {
      body: params
    }
  )
}

export async function reactivateStripeSubscription(input: {
  stripeSubscriptionId: string
}) {
  const params = new URLSearchParams()
  params.set("cancel_at_period_end", "false")

  return stripeRequest<StripeSubscriptionShape>(
    `subscriptions/${input.stripeSubscriptionId}`,
    {
      body: params
    }
  )
}

export async function retrieveStripeSubscription(stripeSubscriptionId: string) {
  return stripeRequest<StripeSubscriptionShape>(
    `subscriptions/${stripeSubscriptionId}`
  )
}

export function verifyStripeWebhookSignature(input: {
  payload: string
  signatureHeader: string | null
}) {
  const environment = getServerEnvironment()

  if (!environment.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required for Stripe webhooks")
  }

  if (!input.signatureHeader) {
    throw new Error("Missing Stripe signature header")
  }

  const fields = input.signatureHeader.split(",").map((entry) => entry.trim())
  const timestamp = fields.find((entry) => entry.startsWith("t="))?.slice(2)
  const signatures = fields
    .filter((entry) => entry.startsWith("v1="))
    .map((entry) => entry.slice(3))

  if (!timestamp || signatures.length === 0) {
    throw new Error("Invalid Stripe signature header")
  }

  const signedPayload = `${timestamp}.${input.payload}`
  const expected = createHmac("sha256", environment.STRIPE_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest("hex")

  const expectedBuffer = Buffer.from(expected)

  const matched = signatures.some((signature) => {
    const candidate = Buffer.from(signature)
    return (
      candidate.length === expectedBuffer.length &&
      timingSafeEqual(candidate, expectedBuffer)
    )
  })

  if (!matched) {
    throw new Error("Stripe signature verification failed")
  }
}
