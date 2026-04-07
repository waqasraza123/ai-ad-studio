import { getServerEnvironment } from "@/lib/env"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import {
  getBillingPlanByCode,
  recordBillingEvent,
  upsertOwnerBillingAccount,
  upsertOwnerSubscription
} from "@/server/billing/billing-service"
import type { BillingPlanCode } from "@/server/database/types"

type ManualSettlementPayload = {
  notes?: string
  ownerId?: string
  periodEnd?: string
  periodStart?: string
  planCode?: BillingPlanCode
  reference?: string
}

function isPlanCode(value: unknown): value is BillingPlanCode {
  return (
    value === "free" ||
    value === "starter" ||
    value === "growth" ||
    value === "scale"
  )
}

export async function POST(request: Request) {
  const environment = getServerEnvironment()
  const authHeader = request.headers.get("authorization")
  const expected = environment.BILLING_OPERATOR_SECRET

  if (!expected) {
    return Response.json(
      {
        error: "BILLING_OPERATOR_SECRET is not configured"
      },
      {
        status: 503
      }
    )
  }

  if (authHeader !== `Bearer ${expected}`) {
    return Response.json(
      {
        error: "Unauthorized"
      },
      {
        status: 401
      }
    )
  }

  const body = (await request.json()) as ManualSettlementPayload

  if (!body.ownerId || !isPlanCode(body.planCode)) {
    return Response.json(
      {
        error: "ownerId and planCode are required"
      },
      {
        status: 400
      }
    )
  }

  const plan = await getBillingPlanByCode(body.planCode, createSupabaseAdminClient())

  if (!plan.allow_manual_invoice) {
    return Response.json(
      {
        error: "Manual settlement is only allowed for plans that support it"
      },
      {
        status: 400
      }
    )
  }

  const periodStart = body.periodStart ?? new Date().toISOString()
  const periodEnd =
    body.periodEnd ??
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  await upsertOwnerBillingAccount(
    {
      manualInvoiceAllowed: true,
      ownerId: body.ownerId
    },
    createSupabaseAdminClient()
  )

  const subscription = await upsertOwnerSubscription(
    {
      current_period_end: periodEnd,
      current_period_start: periodStart,
      manual_payment_reference: body.reference ?? null,
      metadata: {
        notes: body.notes ?? null,
        settlementMethod: "manual_stablecoin"
      },
      overage_cap_usd: Number(plan.monthly_overage_cap_usd),
      owner_id: body.ownerId,
      plan_code: body.planCode,
      provider: "manual_stablecoin",
      status: "active"
    },
    createSupabaseAdminClient()
  )

  await recordBillingEvent(
    {
      eventType: "manual.stablecoin_settlement",
      ownerId: body.ownerId,
      payload: {
        notes: body.notes ?? null,
        planCode: body.planCode,
        reference: body.reference ?? null
      },
      provider: "manual_stablecoin",
      summary: `Manual stablecoin settlement recorded for ${plan.display_name}.`,
      subscriptionId: subscription.id
    },
    createSupabaseAdminClient()
  )

  return Response.json({
    ok: true,
    subscriptionId: subscription.id
  })
}
