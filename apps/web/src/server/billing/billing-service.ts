import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  BillingEventRecord,
  BillingPlanCode,
  BillingPlanRecord,
  BillingUsageRollupRecord,
  EffectiveOwnerLimits,
  OwnerBillingAccountRecord,
  OwnerGuardrailsRecord,
  OwnerSubscriptionRecord,
  OwnerSubscriptionStatus
} from "@/server/database/types"

const billingPlanSelection =
  "code, display_name, monthly_price_usd, included_active_projects, included_concept_runs, included_preview_generations, included_render_batches, included_final_exports, included_storage_bytes, max_concurrent_preview_jobs, max_concurrent_render_jobs, allow_share_links, allow_public_showcase, allow_share_campaigns, allow_delivery_workspaces, allow_external_batch_reviews, watermark_exports, allow_manual_invoice, allow_overage, monthly_overage_cap_usd, concept_run_overage_usd, preview_generation_overage_usd, render_batch_overage_usd, storage_gb_month_overage_usd, internal_total_cost_ceiling_usd, internal_openai_cost_ceiling_usd, internal_runway_cost_ceiling_usd, sort_order, is_active, created_at, updated_at"

const ownerBillingAccountSelection =
  "owner_id, stripe_customer_id, stripe_default_payment_method_id, billing_country, checkout_preference, tax_exempt, stablecoin_eligible, manual_invoice_allowed, created_at, updated_at"

const ownerSubscriptionSelection =
  "id, owner_id, plan_code, provider, status, stripe_subscription_id, stripe_subscription_item_id, stripe_price_id, stripe_checkout_session_id, current_period_start, current_period_end, cancel_at_period_end, cancelled_at, payment_failed_at, grace_period_ends_at, downgrade_to_plan_code, overage_cap_usd, manual_payment_reference, metadata, created_at, updated_at"

const billingUsageRollupSelection =
  "id, owner_id, plan_code, period_start, period_end, active_projects_used, concept_runs_used, preview_generations_used, render_batches_used, final_exports_used, storage_bytes_used, provider_cost_usd, projected_overage_usd, created_at, updated_at"

const billingEventSelection =
  "id, owner_id, subscription_id, provider, provider_event_id, event_type, event_status, summary, payload, event_occurred_at, processed_at, created_at"

const ownerGuardrailsSelection =
  "owner_id, monthly_total_budget_usd, monthly_openai_budget_usd, monthly_runway_budget_usd, max_concurrent_render_jobs, max_concurrent_preview_jobs, auto_block_on_budget, updated_at, created_at"

const BYTES_PER_GB = 1024 * 1024 * 1024

function defaultPeriod(now = new Date()) {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  )
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0)
  )

  return {
    end,
    start
  }
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function toBoolean(value: unknown) {
  return value === true || value === "true" || value === 1 || value === "1"
}

function defaultOwnerGuardrails(ownerId: string): OwnerGuardrailsRecord {
  return {
    auto_block_on_budget: true,
    created_at: new Date(0).toISOString(),
    max_concurrent_preview_jobs: 3,
    max_concurrent_render_jobs: 2,
    monthly_openai_budget_usd: 75,
    monthly_runway_budget_usd: 75,
    monthly_total_budget_usd: 200,
    owner_id: ownerId,
    updated_at: new Date(0).toISOString()
  }
}

function defaultBillingAccount(ownerId: string): OwnerBillingAccountRecord {
  return {
    billing_country: null,
    checkout_preference: "card_or_crypto",
    created_at: new Date(0).toISOString(),
    manual_invoice_allowed: false,
    owner_id: ownerId,
    stablecoin_eligible: true,
    stripe_customer_id: null,
    stripe_default_payment_method_id: null,
    tax_exempt: false,
    updated_at: new Date(0).toISOString()
  }
}

function buildDefaultFreeSubscription(ownerId: string): OwnerSubscriptionRecord {
  const period = defaultPeriod()

  return {
    cancel_at_period_end: false,
    cancelled_at: null,
    created_at: new Date(0).toISOString(),
    current_period_end: period.end.toISOString(),
    current_period_start: period.start.toISOString(),
    downgrade_to_plan_code: null,
    grace_period_ends_at: null,
    id: `free-${ownerId}`,
    manual_payment_reference: null,
    metadata: {},
    overage_cap_usd: 0,
    owner_id: ownerId,
    payment_failed_at: null,
    plan_code: "free",
    provider: "system",
    status: "free",
    stripe_checkout_session_id: null,
    stripe_price_id: null,
    stripe_subscription_id: null,
    stripe_subscription_item_id: null,
    updated_at: new Date(0).toISOString()
  }
}

function normalizeSubscriptionRecord(
  ownerId: string,
  value: Partial<OwnerSubscriptionRecord> | null | undefined
): OwnerSubscriptionRecord {
  const fallback = buildDefaultFreeSubscription(ownerId)

  if (!value) {
    return fallback
  }

  return {
    ...fallback,
    ...value,
    metadata:
      value.metadata && typeof value.metadata === "object" ? value.metadata : {}
  }
}

function normalizeBillingUsageRollup(
  ownerId: string,
  planCode: BillingPlanCode,
  value: Partial<BillingUsageRollupRecord> | null | undefined,
  period = defaultPeriod()
): BillingUsageRollupRecord {
  const fallback: BillingUsageRollupRecord = {
    active_projects_used: 0,
    concept_runs_used: 0,
    created_at: new Date(0).toISOString(),
    final_exports_used: 0,
    id: `usage-${ownerId}-${period.start.toISOString()}`,
    owner_id: ownerId,
    period_end: period.end.toISOString(),
    period_start: period.start.toISOString(),
    plan_code: planCode,
    preview_generations_used: 0,
    projected_overage_usd: 0,
    provider_cost_usd: 0,
    render_batches_used: 0,
    storage_bytes_used: 0,
    updated_at: new Date(0).toISOString()
  }

  return {
    ...fallback,
    ...value
  }
}

function sortPlans(plans: BillingPlanRecord[]) {
  return [...plans].sort((left, right) => left.sort_order - right.sort_order)
}

function calculateProjectedOverage(input: {
  plan: BillingPlanRecord
  usage: Pick<
    BillingUsageRollupRecord,
    | "concept_runs_used"
    | "preview_generations_used"
    | "render_batches_used"
    | "storage_bytes_used"
  >
}) {
  const conceptOverage = Math.max(
    input.usage.concept_runs_used - input.plan.included_concept_runs,
    0
  )
  const previewOverage = Math.max(
    input.usage.preview_generations_used - input.plan.included_preview_generations,
    0
  )
  const renderBatchOverage = Math.max(
    input.usage.render_batches_used - input.plan.included_render_batches,
    0
  )
  const storageOverageBytes = Math.max(
    input.usage.storage_bytes_used - input.plan.included_storage_bytes,
    0
  )

  return Number(
    (
      conceptOverage * input.plan.concept_run_overage_usd +
      previewOverage * input.plan.preview_generation_overage_usd +
      renderBatchOverage * input.plan.render_batch_overage_usd +
      (storageOverageBytes / BYTES_PER_GB) *
        input.plan.storage_gb_month_overage_usd
    ).toFixed(2)
  )
}

function resolveEffectiveSubscription(input: {
  now?: Date
  subscription: OwnerSubscriptionRecord
}): OwnerSubscriptionRecord {
  const now = input.now ?? new Date()
  const subscription = input.subscription
  const currentPeriodEnd = new Date(subscription.current_period_end)

  if (subscription.status === "free") {
    return subscription
  }

  if (now < currentPeriodEnd) {
    return subscription
  }

  if (subscription.downgrade_to_plan_code) {
    return {
      ...buildDefaultFreeSubscription(subscription.owner_id),
      plan_code: subscription.downgrade_to_plan_code,
      status: (
        subscription.downgrade_to_plan_code === "free" ? "free" : "active"
      ) as OwnerSubscriptionStatus
    }
  }

  return buildDefaultFreeSubscription(subscription.owner_id)
}

async function resolveClient(client?: SupabaseClient) {
  return client ?? createSupabaseServerClient()
}

export async function listBillingPlans(client?: SupabaseClient) {
  const supabase = await resolveClient(client)
  const { data, error } = await supabase
    .from("billing_plans")
    .select(billingPlanSelection)
    .eq("is_active", true)

  if (error) {
    throw new Error("Failed to list billing plans")
  }

  return sortPlans((data ?? []) as BillingPlanRecord[])
}

export async function getBillingPlanByCode(
  planCode: BillingPlanCode,
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  const { data, error } = await supabase
    .from("billing_plans")
    .select(billingPlanSelection)
    .eq("code", planCode)
    .maybeSingle()

  if (error || !data) {
    throw new Error(`Failed to load billing plan: ${planCode}`)
  }

  return data as BillingPlanRecord
}

export async function ensureOwnerBillingAccount(
  ownerId: string,
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)

  const { data, error } = await supabase
    .from("owner_billing_accounts")
    .upsert(
      {
        owner_id: ownerId
      },
      {
        onConflict: "owner_id"
      }
    )
    .select(ownerBillingAccountSelection)
    .single()

  if (error) {
    throw new Error("Failed to ensure owner billing account")
  }

  return data as OwnerBillingAccountRecord
}

export async function getOwnerBillingAccount(
  ownerId: string,
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  const { data, error } = await supabase
    .from("owner_billing_accounts")
    .select(ownerBillingAccountSelection)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load owner billing account")
  }

  return (data ?? defaultBillingAccount(ownerId)) as OwnerBillingAccountRecord
}

export async function upsertOwnerBillingAccount(
  input: {
    ownerId: string
    billingCountry?: string | null
    checkoutPreference?: OwnerBillingAccountRecord["checkout_preference"]
    manualInvoiceAllowed?: boolean
    stablecoinEligible?: boolean
    stripeCustomerId?: string | null
    stripeDefaultPaymentMethodId?: string | null
    taxExempt?: boolean
  },
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  const payload = {
    billing_country: input.billingCountry ?? null,
    checkout_preference: input.checkoutPreference ?? "card_or_crypto",
    manual_invoice_allowed: input.manualInvoiceAllowed ?? false,
    owner_id: input.ownerId,
    stablecoin_eligible: input.stablecoinEligible ?? true,
    stripe_customer_id: input.stripeCustomerId ?? null,
    stripe_default_payment_method_id: input.stripeDefaultPaymentMethodId ?? null,
    tax_exempt: input.taxExempt ?? false
  }

  const { data, error } = await supabase
    .from("owner_billing_accounts")
    .upsert(payload, {
      onConflict: "owner_id"
    })
    .select(ownerBillingAccountSelection)
    .single()

  if (error) {
    throw new Error("Failed to update owner billing account")
  }

  return data as OwnerBillingAccountRecord
}

export async function ensureOwnerSubscription(
  ownerId: string,
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  const plan = await getBillingPlanByCode("free", supabase)
  const period = defaultPeriod()

  const { data, error } = await supabase
    .from("owner_subscriptions")
    .upsert(
      {
        current_period_end: period.end.toISOString(),
        current_period_start: period.start.toISOString(),
        overage_cap_usd: plan.monthly_overage_cap_usd,
        owner_id: ownerId,
        plan_code: "free",
        provider: "system",
        status: "free"
      },
      {
        onConflict: "owner_id"
      }
    )
    .select(ownerSubscriptionSelection)
    .single()

  if (error) {
    throw new Error("Failed to ensure owner subscription")
  }

  return data as OwnerSubscriptionRecord
}

export async function getOwnerSubscription(
  ownerId: string,
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  const { data, error } = await supabase
    .from("owner_subscriptions")
    .select(ownerSubscriptionSelection)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load owner subscription")
  }

  return normalizeSubscriptionRecord(ownerId, data as OwnerSubscriptionRecord | null)
}

export async function upsertOwnerSubscription(
  input: Partial<OwnerSubscriptionRecord> & {
    owner_id: string
    plan_code: BillingPlanCode
    status: OwnerSubscriptionStatus
    current_period_start: string
    current_period_end: string
  },
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)

  const payload = {
    cancel_at_period_end: input.cancel_at_period_end ?? false,
    cancelled_at: input.cancelled_at ?? null,
    current_period_end: input.current_period_end,
    current_period_start: input.current_period_start,
    downgrade_to_plan_code: input.downgrade_to_plan_code ?? null,
    grace_period_ends_at: input.grace_period_ends_at ?? null,
    manual_payment_reference: input.manual_payment_reference ?? null,
    metadata: input.metadata ?? {},
    overage_cap_usd: input.overage_cap_usd ?? 0,
    owner_id: input.owner_id,
    payment_failed_at: input.payment_failed_at ?? null,
    plan_code: input.plan_code,
    provider: input.provider ?? "system",
    status: input.status,
    stripe_checkout_session_id: input.stripe_checkout_session_id ?? null,
    stripe_price_id: input.stripe_price_id ?? null,
    stripe_subscription_id: input.stripe_subscription_id ?? null,
    stripe_subscription_item_id: input.stripe_subscription_item_id ?? null
  }

  const { data, error } = await supabase
    .from("owner_subscriptions")
    .upsert(payload, {
      onConflict: "owner_id"
    })
    .select(ownerSubscriptionSelection)
    .single()

  if (error) {
    throw new Error("Failed to upsert owner subscription")
  }

  return data as OwnerSubscriptionRecord
}

export async function listBillingEventsByOwner(
  ownerId: string,
  input?: {
    eventTypePrefix?: string
    limit?: number
  },
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  let query = supabase
    .from("billing_events")
    .select(billingEventSelection)
    .eq("owner_id", ownerId)
    .order("event_occurred_at", { ascending: false })
    .limit(Math.min(Math.max(input?.limit ?? 20, 1), 100))

  if (input?.eventTypePrefix) {
    query = query.ilike("event_type", `${input.eventTypePrefix}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error("Failed to list billing events")
  }

  return (data ?? []) as BillingEventRecord[]
}

export async function recordBillingEvent(
  input: {
    ownerId?: string | null
    subscriptionId?: string | null
    provider?: string
    providerEventId?: string | null
    eventType: string
    eventStatus?: BillingEventRecord["event_status"]
    summary?: string | null
    payload?: Record<string, unknown>
    eventOccurredAt?: string
    processedAt?: string | null
  },
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  const payload = {
    event_occurred_at: input.eventOccurredAt ?? new Date().toISOString(),
    event_status: input.eventStatus ?? "processed",
    event_type: input.eventType,
    owner_id: input.ownerId ?? null,
    payload: input.payload ?? {},
    processed_at: input.processedAt ?? new Date().toISOString(),
    provider: input.provider ?? "system",
    provider_event_id: input.providerEventId ?? null,
    subscription_id: input.subscriptionId ?? null,
    summary: input.summary ?? null
  }

  const query = input.providerEventId
    ? supabase.from("billing_events").upsert(payload, {
        onConflict: "provider,provider_event_id",
        ignoreDuplicates: false
      })
    : supabase.from("billing_events").insert(payload)

  const { data, error } = await query
    .select(billingEventSelection)
    .single()

  if (error) {
    throw new Error("Failed to record billing event")
  }

  return data as BillingEventRecord
}

async function getOwnerGuardrails(
  ownerId: string,
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  const { data, error } = await supabase
    .from("owner_guardrails")
    .select(ownerGuardrailsSelection)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load owner guardrails")
  }

  return (data ?? defaultOwnerGuardrails(ownerId)) as OwnerGuardrailsRecord
}

async function computeBillingUsageRollup(
  ownerId: string,
  planCode: BillingPlanCode,
  subscription: OwnerSubscriptionRecord,
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  const periodStart = subscription.current_period_start
  const periodEnd = subscription.current_period_end

  const [
    usageEventsResult,
    projectsResult,
    renderBatchesResult,
    exportsResult,
    assetsResult
  ] = await Promise.all([
    supabase
      .from("usage_events")
      .select("event_type, provider, units, estimated_cost_usd")
      .eq("owner_id", ownerId)
      .gte("created_at", periodStart)
      .lt("created_at", periodEnd),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId),
    supabase
      .from("render_batches")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .gte("created_at", periodStart)
      .lt("created_at", periodEnd),
    supabase
      .from("exports")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .gte("created_at", periodStart)
      .lt("created_at", periodEnd),
    supabase
      .from("assets")
      .select("metadata")
      .eq("owner_id", ownerId)
  ])

  if (
    usageEventsResult.error ||
    projectsResult.error ||
    renderBatchesResult.error ||
    exportsResult.error ||
    assetsResult.error
  ) {
    throw new Error("Failed to compute billing usage rollup")
  }

  let conceptRunsUsed = 0
  let previewGenerationsUsed = 0
  let providerCostUsd = 0

  for (const row of usageEventsResult.data ?? []) {
    const eventType = String(row.event_type ?? "")
    const units = toNumber(row.units)
    providerCostUsd += toNumber(row.estimated_cost_usd)

    if (eventType === "concept_generation") {
      conceptRunsUsed += 1
    }

    if (eventType === "concept_preview_generation") {
      previewGenerationsUsed += units
    }
  }

  const storageBytesUsed = (assetsResult.data ?? []).reduce((total, asset) => {
    const metadata =
      asset && typeof asset.metadata === "object" && asset.metadata
        ? (asset.metadata as Record<string, unknown>)
        : {}

    return total + toNumber(metadata.sizeBytes)
  }, 0)

  return {
    active_projects_used: projectsResult.count ?? 0,
    concept_runs_used: conceptRunsUsed,
    final_exports_used: exportsResult.count ?? 0,
    owner_id: ownerId,
    period_end: periodEnd,
    period_start: periodStart,
    plan_code: planCode,
    preview_generations_used: previewGenerationsUsed,
    provider_cost_usd: Number(providerCostUsd.toFixed(2)),
    render_batches_used: renderBatchesResult.count ?? 0,
    storage_bytes_used: storageBytesUsed
  }
}

export async function syncBillingUsageRollup(
  ownerId: string,
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  const rawSubscription = await getOwnerSubscription(ownerId, supabase)
  const subscription = resolveEffectiveSubscription({
    subscription: rawSubscription
  })
  const plan = await getBillingPlanByCode(subscription.plan_code, supabase)
  const base = await computeBillingUsageRollup(
    ownerId,
    subscription.plan_code,
    subscription,
    supabase
  )

  const projectedOverageUsd = calculateProjectedOverage({
    plan,
    usage: {
      concept_runs_used: base.concept_runs_used,
      preview_generations_used: base.preview_generations_used,
      render_batches_used: base.render_batches_used,
      storage_bytes_used: base.storage_bytes_used
    }
  })

  const { data, error } = await supabase
    .from("billing_usage_rollups")
    .upsert(
      {
        ...base,
        projected_overage_usd: projectedOverageUsd
      },
      {
        onConflict: "owner_id,period_start"
      }
    )
    .select(billingUsageRollupSelection)
    .single()

  if (error) {
    throw new Error("Failed to sync billing usage rollup")
  }

  return normalizeBillingUsageRollup(
    ownerId,
    subscription.plan_code,
    data as BillingUsageRollupRecord,
    {
      end: new Date(subscription.current_period_end),
      start: new Date(subscription.current_period_start)
    }
  )
}

export async function getEffectiveOwnerLimits(
  ownerId: string,
  client?: SupabaseClient
): Promise<EffectiveOwnerLimits> {
  const supabase = await resolveClient(client)
  const [billingAccount, rawSubscription, guardrails] = await Promise.all([
    getOwnerBillingAccount(ownerId, supabase),
    getOwnerSubscription(ownerId, supabase),
    getOwnerGuardrails(ownerId, supabase)
  ])

  const subscription = resolveEffectiveSubscription({
    subscription: rawSubscription
  })
  const [plan, usage] = await Promise.all([
    getBillingPlanByCode(subscription.plan_code, supabase),
    syncBillingUsageRollup(ownerId, supabase)
  ])

  const autoBlockOnBudget = toBoolean(guardrails.auto_block_on_budget)
  const monthlyTotalBudgetUsd = autoBlockOnBudget
    ? Math.min(
        toNumber(guardrails.monthly_total_budget_usd),
        toNumber(plan.internal_total_cost_ceiling_usd)
      )
    : toNumber(plan.internal_total_cost_ceiling_usd)
  const monthlyOpenaiBudgetUsd = autoBlockOnBudget
    ? Math.min(
        toNumber(guardrails.monthly_openai_budget_usd),
        toNumber(plan.internal_openai_cost_ceiling_usd)
      )
    : toNumber(plan.internal_openai_cost_ceiling_usd)
  const monthlyRunwayBudgetUsd = autoBlockOnBudget
    ? Math.min(
        toNumber(guardrails.monthly_runway_budget_usd),
        toNumber(plan.internal_runway_cost_ceiling_usd)
      )
    : toNumber(plan.internal_runway_cost_ceiling_usd)

  const overageCapUsd = Math.min(
    toNumber(subscription.overage_cap_usd || plan.monthly_overage_cap_usd),
    toNumber(plan.monthly_overage_cap_usd)
  )

  const now = new Date()
  let generationBlocked = false
  let generationBlockReason: string | null = null

  const gracePeriodEndsAt = subscription.grace_period_ends_at
    ? new Date(subscription.grace_period_ends_at)
    : null

  if (
    subscription.status === "incomplete" ||
    subscription.status === "incomplete_expired" ||
    subscription.status === "unpaid"
  ) {
    generationBlocked = true
    generationBlockReason = "subscription_payment_required"
  }

  if (
    !generationBlocked &&
    (subscription.status === "past_due" || subscription.status === "grace_period") &&
    gracePeriodEndsAt &&
    now > gracePeriodEndsAt
  ) {
    generationBlocked = true
    generationBlockReason = "subscription_grace_period_expired"
  }

  if (
    !generationBlocked &&
    monthlyTotalBudgetUsd > 0 &&
    usage.provider_cost_usd >= monthlyTotalBudgetUsd
  ) {
    generationBlocked = true
    generationBlockReason = "provider_cost_ceiling_reached"
  }

  if (
    !generationBlocked &&
    plan.allow_overage &&
    overageCapUsd > 0 &&
    usage.projected_overage_usd >= overageCapUsd
  ) {
    generationBlocked = true
    generationBlockReason = "monthly_overage_cap_reached"
  }

  return {
    billingAccount,
    budgets: {
      autoBlockOnBudget,
      monthlyOpenaiBudgetUsd,
      monthlyOverageCapUsd: overageCapUsd,
      monthlyRunwayBudgetUsd,
      monthlyTotalBudgetUsd,
      projectedOverageUsd: usage.projected_overage_usd,
      providerCostUsd: usage.provider_cost_usd
    },
    featureAccess: {
      allowDeliveryWorkspaces: plan.allow_delivery_workspaces,
      allowExternalBatchReviews: plan.allow_external_batch_reviews,
      allowManualInvoice: plan.allow_manual_invoice,
      allowPublicShowcase: plan.allow_public_showcase,
      allowShareCampaigns: plan.allow_share_campaigns,
      allowShareLinks: plan.allow_share_links,
      watermarkExports: plan.watermark_exports
    },
    generationBlocked,
    generationBlockReason,
    guardrails: {
      ...guardrails,
      max_concurrent_preview_jobs: Math.min(
        toNumber(guardrails.max_concurrent_preview_jobs),
        toNumber(plan.max_concurrent_preview_jobs),
        3
      ),
      max_concurrent_render_jobs: Math.min(
        toNumber(guardrails.max_concurrent_render_jobs),
        toNumber(plan.max_concurrent_render_jobs),
        3
      ),
      monthly_openai_budget_usd: monthlyOpenaiBudgetUsd,
      monthly_runway_budget_usd: monthlyRunwayBudgetUsd,
      monthly_total_budget_usd: monthlyTotalBudgetUsd
    },
    hardCaps: {
      activeProjects: toNumber(plan.included_active_projects),
      conceptRuns: toNumber(plan.included_concept_runs),
      concurrentPreviewJobs: Math.min(
        toNumber(guardrails.max_concurrent_preview_jobs),
        toNumber(plan.max_concurrent_preview_jobs),
        3
      ),
      concurrentRenderJobs: Math.min(
        toNumber(guardrails.max_concurrent_render_jobs),
        toNumber(plan.max_concurrent_render_jobs),
        3
      ),
      finalExports: toNumber(plan.included_final_exports),
      previewGenerations: toNumber(plan.included_preview_generations),
      renderBatches: toNumber(plan.included_render_batches),
      storageBytes: toNumber(plan.included_storage_bytes)
    },
    plan,
    subscription,
    usage
  }
}

export type BillingGateAction =
  | "create_project"
  | "generate_concepts"
  | "generate_previews"
  | "start_render_batch"
  | "publish_showcase"
  | "publish_share_campaign"
  | "publish_delivery_workspace"
  | "create_batch_review_link"

export type BillingGateDecision = {
  allowed: boolean
  code: string | null
  limits: EffectiveOwnerLimits
}

function withActionIncrements(
  limits: EffectiveOwnerLimits,
  increments: {
    activeProjects?: number
    conceptRuns?: number
    finalExports?: number
    previewGenerations?: number
    renderBatches?: number
    storageBytes?: number
  }
) {
  return {
    activeProjects: limits.usage.active_projects_used + (increments.activeProjects ?? 0),
    conceptRuns: limits.usage.concept_runs_used + (increments.conceptRuns ?? 0),
    finalExports: limits.usage.final_exports_used + (increments.finalExports ?? 0),
    previewGenerations:
      limits.usage.preview_generations_used + (increments.previewGenerations ?? 0),
    renderBatches: limits.usage.render_batches_used + (increments.renderBatches ?? 0),
    storageBytes: limits.usage.storage_bytes_used + (increments.storageBytes ?? 0)
  }
}

function predictedOverage(
  limits: EffectiveOwnerLimits,
  increments: {
    conceptRuns?: number
    previewGenerations?: number
    renderBatches?: number
    storageBytes?: number
  }
) {
  return calculateProjectedOverage({
    plan: limits.plan,
    usage: {
      concept_runs_used: limits.usage.concept_runs_used + (increments.conceptRuns ?? 0),
      preview_generations_used:
        limits.usage.preview_generations_used + (increments.previewGenerations ?? 0),
      render_batches_used:
        limits.usage.render_batches_used + (increments.renderBatches ?? 0),
      storage_bytes_used:
        limits.usage.storage_bytes_used + (increments.storageBytes ?? 0)
    }
  })
}

export async function getBillingGateDecision(
  ownerId: string,
  action: BillingGateAction,
  input?: {
    activeProjects?: number
    conceptRuns?: number
    finalExports?: number
    previewGenerations?: number
    renderBatches?: number
    storageBytes?: number
  },
  client?: SupabaseClient
): Promise<BillingGateDecision> {
  const limits = await getEffectiveOwnerLimits(ownerId, client)

  if (
    action === "publish_showcase" &&
    !limits.featureAccess.allowPublicShowcase
  ) {
    return { allowed: false, code: "billing_upgrade_required_showcase", limits }
  }

  if (
    action === "publish_share_campaign" &&
    !limits.featureAccess.allowShareCampaigns
  ) {
    return { allowed: false, code: "billing_upgrade_required_campaign", limits }
  }

  if (
    action === "publish_delivery_workspace" &&
    !limits.featureAccess.allowDeliveryWorkspaces
  ) {
    return { allowed: false, code: "billing_upgrade_required_delivery", limits }
  }

  if (
    action === "create_batch_review_link" &&
    !limits.featureAccess.allowExternalBatchReviews
  ) {
    return { allowed: false, code: "billing_upgrade_required_external_review", limits }
  }

  if (
    action === "generate_concepts" ||
    action === "generate_previews" ||
    action === "start_render_batch"
  ) {
    if (limits.generationBlocked) {
      return {
        allowed: false,
        code: limits.generationBlockReason ?? "billing_generation_blocked",
        limits
      }
    }
  }

  const projected = withActionIncrements(limits, input ?? {})

  if (projected.activeProjects > limits.hardCaps.activeProjects) {
    return { allowed: false, code: "billing_project_limit_reached", limits }
  }

  if (projected.finalExports > limits.hardCaps.finalExports) {
    return { allowed: false, code: "billing_export_limit_reached", limits }
  }

  if (projected.storageBytes > limits.hardCaps.storageBytes) {
    return { allowed: false, code: "billing_storage_limit_reached", limits }
  }

  if (!limits.plan.allow_overage) {
    if (projected.conceptRuns > limits.hardCaps.conceptRuns) {
      return { allowed: false, code: "billing_concept_limit_reached", limits }
    }

    if (projected.previewGenerations > limits.hardCaps.previewGenerations) {
      return { allowed: false, code: "billing_preview_limit_reached", limits }
    }

    if (projected.renderBatches > limits.hardCaps.renderBatches) {
      return { allowed: false, code: "billing_render_batch_limit_reached", limits }
    }

    return { allowed: true, code: null, limits }
  }

  const nextProjectedOverage = predictedOverage(limits, {
    conceptRuns: input?.conceptRuns,
    previewGenerations: input?.previewGenerations,
    renderBatches: input?.renderBatches,
    storageBytes: input?.storageBytes
  })

  if (
    limits.budgets.monthlyOverageCapUsd > 0 &&
    nextProjectedOverage > limits.budgets.monthlyOverageCapUsd
  ) {
    return { allowed: false, code: "billing_overage_cap_reached", limits }
  }

  return { allowed: true, code: null, limits }
}

export async function hasPublicFeatureAccess(
  ownerId: string,
  feature:
    | "allowDeliveryWorkspaces"
    | "allowExternalBatchReviews"
    | "allowPublicShowcase"
    | "allowShareCampaigns",
  publishedAt: string,
  client?: SupabaseClient
) {
  const supabase = await resolveClient(client)
  const [limits, rawSubscription] = await Promise.all([
    getEffectiveOwnerLimits(ownerId, supabase),
    getOwnerSubscription(ownerId, supabase)
  ])

  if (limits.featureAccess[feature]) {
    return true
  }

  if (rawSubscription.plan_code === "free") {
    return false
  }

  const sunsetDate = new Date(rawSubscription.current_period_end)
  sunsetDate.setUTCDate(sunsetDate.getUTCDate() + 30)

  return new Date(publishedAt) <= sunsetDate && new Date() <= sunsetDate
}

export function formatStorage(value: number) {
  if (value <= 0) {
    return "0 GB"
  }

  return `${(value / BYTES_PER_GB).toFixed(value >= BYTES_PER_GB ? 1 : 2)} GB`
}
