import type { SupabaseClient } from "@supabase/supabase-js"
import type { WorkerJobRecord } from "@/repositories/jobs-repository"

type BillingPlanCode = "free" | "starter" | "growth" | "scale"

type WorkerBillingPlanRecord = {
  code: BillingPlanCode
  included_active_projects: number
  included_concept_runs: number
  included_preview_generations: number
  included_render_batches: number
  included_final_exports: number
  included_storage_bytes: number
  max_concurrent_preview_jobs: number
  max_concurrent_render_jobs: number
  allow_delivery_workspaces: boolean
  allow_external_batch_reviews: boolean
  allow_overage: boolean
  allow_public_showcase: boolean
  allow_share_campaigns: boolean
  allow_share_links: boolean
  allow_manual_invoice: boolean
  concept_run_overage_usd: number
  internal_openai_cost_ceiling_usd: number
  internal_runway_cost_ceiling_usd: number
  internal_total_cost_ceiling_usd: number
  monthly_overage_cap_usd: number
  preview_generation_overage_usd: number
  render_batch_overage_usd: number
  storage_gb_month_overage_usd: number
  watermark_exports: boolean
}

type WorkerOwnerGuardrails = {
  auto_block_on_budget: boolean
  max_concurrent_preview_jobs: number
  max_concurrent_render_jobs: number
  monthly_openai_budget_usd: number
  monthly_runway_budget_usd: number
  monthly_total_budget_usd: number
}

type WorkerOwnerSubscription = {
  current_period_end: string
  current_period_start: string
  grace_period_ends_at: string | null
  overage_cap_usd: number
  owner_id: string
  plan_code: BillingPlanCode
  status:
    | "free"
    | "trialing"
    | "active"
    | "past_due"
    | "grace_period"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "unpaid"
}

type WorkerUsageRollup = {
  active_projects_used: number
  concept_runs_used: number
  final_exports_used: number
  period_end: string
  period_start: string
  preview_generations_used: number
  projected_overage_usd: number
  provider_cost_usd: number
  render_batches_used: number
  storage_bytes_used: number
}

type WorkerEffectiveBillingLimits = {
  generationBlocked: boolean
  generationBlockReason: string | null
  guardrails: WorkerOwnerGuardrails
  plan: WorkerBillingPlanRecord
  subscription: WorkerOwnerSubscription
  usage: WorkerUsageRollup
}

const BYTES_PER_GB = 1024 * 1024 * 1024

const billingPlanSelection =
  "code, included_active_projects, included_concept_runs, included_preview_generations, included_render_batches, included_final_exports, included_storage_bytes, max_concurrent_preview_jobs, max_concurrent_render_jobs, allow_delivery_workspaces, allow_external_batch_reviews, allow_overage, allow_public_showcase, allow_share_campaigns, allow_share_links, allow_manual_invoice, concept_run_overage_usd, internal_openai_cost_ceiling_usd, internal_runway_cost_ceiling_usd, internal_total_cost_ceiling_usd, monthly_overage_cap_usd, preview_generation_overage_usd, render_batch_overage_usd, storage_gb_month_overage_usd, watermark_exports"

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

function defaultFreeSubscription(ownerId: string): WorkerOwnerSubscription {
  const period = defaultPeriod()

  return {
    current_period_end: period.end.toISOString(),
    current_period_start: period.start.toISOString(),
    grace_period_ends_at: null,
    overage_cap_usd: 0,
    owner_id: ownerId,
    plan_code: "free",
    status: "free"
  }
}

function defaultGuardrails(): WorkerOwnerGuardrails {
  return {
    auto_block_on_budget: true,
    max_concurrent_preview_jobs: 3,
    max_concurrent_render_jobs: 2,
    monthly_openai_budget_usd: 75,
    monthly_runway_budget_usd: 75,
    monthly_total_budget_usd: 200
  }
}

function calculateProjectedOverage(
  plan: WorkerBillingPlanRecord,
  usage: Pick<
    WorkerUsageRollup,
    | "concept_runs_used"
    | "preview_generations_used"
    | "render_batches_used"
    | "storage_bytes_used"
  >
) {
  const conceptOverage = Math.max(
    usage.concept_runs_used - plan.included_concept_runs,
    0
  )
  const previewOverage = Math.max(
    usage.preview_generations_used - plan.included_preview_generations,
    0
  )
  const renderBatchOverage = Math.max(
    usage.render_batches_used - plan.included_render_batches,
    0
  )
  const storageOverageBytes = Math.max(
    usage.storage_bytes_used - plan.included_storage_bytes,
    0
  )

  return Number(
    (
      conceptOverage * plan.concept_run_overage_usd +
      previewOverage * plan.preview_generation_overage_usd +
      renderBatchOverage * plan.render_batch_overage_usd +
      (storageOverageBytes / BYTES_PER_GB) * plan.storage_gb_month_overage_usd
    ).toFixed(2)
  )
}

async function getBillingPlan(
  supabase: SupabaseClient,
  planCode: BillingPlanCode
) {
  const { data, error } = await supabase
    .from("billing_plans")
    .select(billingPlanSelection)
    .eq("code", planCode)
    .maybeSingle()

  if (error || !data) {
    throw new Error("Failed to load billing plan")
  }

  return data as WorkerBillingPlanRecord
}

async function getOwnerSubscription(
  supabase: SupabaseClient,
  ownerId: string
) {
  const { data, error } = await supabase
    .from("owner_subscriptions")
    .select(
      "owner_id, plan_code, status, current_period_start, current_period_end, grace_period_ends_at, overage_cap_usd"
    )
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load owner subscription")
  }

  return (data ?? defaultFreeSubscription(ownerId)) as WorkerOwnerSubscription
}

async function getOwnerGuardrails(
  supabase: SupabaseClient,
  ownerId: string
) {
  const { data, error } = await supabase
    .from("owner_guardrails")
    .select(
      "monthly_total_budget_usd, monthly_openai_budget_usd, monthly_runway_budget_usd, max_concurrent_render_jobs, max_concurrent_preview_jobs, auto_block_on_budget"
    )
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load owner guardrails")
  }

  return (data ?? defaultGuardrails()) as WorkerOwnerGuardrails
}

function resolveEffectiveSubscription(subscription: WorkerOwnerSubscription) {
  const now = new Date()
  const currentPeriodEnd = new Date(subscription.current_period_end)

  if (subscription.status === "free" || now < currentPeriodEnd) {
    return subscription
  }

  return defaultFreeSubscription(subscription.owner_id)
}

async function syncUsageRollup(
  supabase: SupabaseClient,
  ownerId: string,
  planCode: BillingPlanCode,
  subscription: WorkerOwnerSubscription
) {
  const [
    usageEventsResult,
    projectsResult,
    renderBatchesResult,
    exportsResult,
    assetsResult
  ] = await Promise.all([
    supabase
      .from("usage_events")
      .select("event_type, units, estimated_cost_usd")
      .eq("owner_id", ownerId)
      .gte("created_at", subscription.current_period_start)
      .lt("created_at", subscription.current_period_end),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId),
    supabase
      .from("render_batches")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .gte("created_at", subscription.current_period_start)
      .lt("created_at", subscription.current_period_end),
    supabase
      .from("exports")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .gte("created_at", subscription.current_period_start)
      .lt("created_at", subscription.current_period_end),
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
    throw new Error("Failed to sync billing usage")
  }

  let conceptRunsUsed = 0
  let previewGenerationsUsed = 0
  let providerCostUsd = 0

  for (const row of usageEventsResult.data ?? []) {
    const eventType = String(row.event_type ?? "")
    providerCostUsd += toNumber(row.estimated_cost_usd)

    if (eventType === "concept_generation") {
      conceptRunsUsed += 1
    }

    if (eventType === "concept_preview_generation") {
      previewGenerationsUsed += toNumber(row.units)
    }
  }

  const storageBytesUsed = (assetsResult.data ?? []).reduce((total, asset) => {
    const metadata =
      asset && typeof asset.metadata === "object" && asset.metadata
        ? (asset.metadata as Record<string, unknown>)
        : {}

    return total + toNumber(metadata.sizeBytes)
  }, 0)

  const plan = await getBillingPlan(supabase, planCode)
  const projectedOverageUsd = calculateProjectedOverage(plan, {
    concept_runs_used: conceptRunsUsed,
    preview_generations_used: previewGenerationsUsed,
    render_batches_used: renderBatchesResult.count ?? 0,
    storage_bytes_used: storageBytesUsed
  })

  const payload = {
    active_projects_used: projectsResult.count ?? 0,
    concept_runs_used: conceptRunsUsed,
    final_exports_used: exportsResult.count ?? 0,
    owner_id: ownerId,
    period_end: subscription.current_period_end,
    period_start: subscription.current_period_start,
    plan_code: planCode,
    preview_generations_used: previewGenerationsUsed,
    projected_overage_usd: projectedOverageUsd,
    provider_cost_usd: Number(providerCostUsd.toFixed(2)),
    render_batches_used: renderBatchesResult.count ?? 0,
    storage_bytes_used: storageBytesUsed
  }

  const { error } = await supabase.from("billing_usage_rollups").upsert(payload, {
    onConflict: "owner_id,period_start"
  })

  if (error) {
    throw new Error("Failed to persist billing usage rollup")
  }

  return payload as WorkerUsageRollup
}

export async function getEffectiveOwnerBillingLimits(
  supabase: SupabaseClient,
  ownerId: string
): Promise<WorkerEffectiveBillingLimits> {
  const rawSubscription = await getOwnerSubscription(supabase, ownerId)
  const subscription = resolveEffectiveSubscription(rawSubscription)
  const [plan, guardrails, usage] = await Promise.all([
    getBillingPlan(supabase, subscription.plan_code),
    getOwnerGuardrails(supabase, ownerId),
    syncUsageRollup(supabase, ownerId, subscription.plan_code, subscription)
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

  const effectiveGuardrails: WorkerOwnerGuardrails = {
    auto_block_on_budget: autoBlockOnBudget,
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
  }

  let generationBlocked = false
  let generationBlockReason: string | null = null

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
    subscription.grace_period_ends_at &&
    new Date() > new Date(subscription.grace_period_ends_at)
  ) {
    generationBlocked = true
    generationBlockReason = "subscription_grace_period_expired"
  }

  if (
    !generationBlocked &&
    effectiveGuardrails.monthly_total_budget_usd > 0 &&
    usage.provider_cost_usd >= effectiveGuardrails.monthly_total_budget_usd
  ) {
    generationBlocked = true
    generationBlockReason = "provider_cost_ceiling_reached"
  }

  if (
    !generationBlocked &&
    plan.allow_overage &&
    Math.min(toNumber(subscription.overage_cap_usd), toNumber(plan.monthly_overage_cap_usd)) > 0 &&
    usage.projected_overage_usd >=
      Math.min(
        toNumber(subscription.overage_cap_usd || plan.monthly_overage_cap_usd),
        toNumber(plan.monthly_overage_cap_usd)
      )
  ) {
    generationBlocked = true
    generationBlockReason = "monthly_overage_cap_reached"
  }

  return {
    generationBlocked,
    generationBlockReason,
    guardrails: effectiveGuardrails,
    plan,
    subscription,
    usage
  }
}

export async function getOwnerConcurrencyLimitForJob(
  supabase: SupabaseClient,
  ownerId: string,
  jobType: WorkerJobRecord["type"]
) {
  const limits = await getEffectiveOwnerBillingLimits(supabase, ownerId)

  if (jobType === "render_final_ad") {
    return limits.guardrails.max_concurrent_render_jobs
  }

  if (jobType === "generate_concept_preview") {
    return limits.guardrails.max_concurrent_preview_jobs
  }

  return 2
}

export async function getBillingGateDecisionForJob(
  supabase: SupabaseClient,
  job: WorkerJobRecord
) {
  const limits = await getEffectiveOwnerBillingLimits(supabase, job.owner_id)

  if (limits.generationBlocked) {
    return {
      allowed: false,
      reason: limits.generationBlockReason ?? "billing_generation_blocked"
    }
  }

  let conceptRuns = 0
  let previewGenerations = 0
  let renderBatches = 0
  let finalExports = 0

  if (job.type === "generate_concepts") {
    conceptRuns = 1
  }

  if (job.type === "generate_concept_preview") {
    const { count, error } = await supabase
      .from("concepts")
      .select("id", { count: "exact", head: true })
      .eq("project_id", job.project_id)

    if (error) {
      throw new Error("Failed to count concepts for billing gate")
    }

    previewGenerations = count ?? 0
  }

  if (job.type === "render_final_ad") {
    const aspectRatios = Array.isArray(job.payload.aspectRatios)
      ? job.payload.aspectRatios
      : ["9:16"]
    const variantKeys = Array.isArray(job.payload.batchVariantKeys)
      ? job.payload.batchVariantKeys
      : [job.payload.variantKey ?? "default"]

    renderBatches = 1
    finalExports = aspectRatios.length * variantKeys.length
  }

  if (!limits.plan.allow_overage) {
    if (limits.usage.concept_runs_used + conceptRuns > limits.plan.included_concept_runs) {
      return { allowed: false, reason: "billing_concept_limit_reached" }
    }

    if (
      limits.usage.preview_generations_used + previewGenerations >
      limits.plan.included_preview_generations
    ) {
      return { allowed: false, reason: "billing_preview_limit_reached" }
    }

    if (
      limits.usage.render_batches_used + renderBatches >
      limits.plan.included_render_batches
    ) {
      return { allowed: false, reason: "billing_render_batch_limit_reached" }
    }
  } else {
    const projectedOverage = calculateProjectedOverage(limits.plan, {
      concept_runs_used: limits.usage.concept_runs_used + conceptRuns,
      preview_generations_used:
        limits.usage.preview_generations_used + previewGenerations,
      render_batches_used: limits.usage.render_batches_used + renderBatches,
      storage_bytes_used: limits.usage.storage_bytes_used
    })

    const overageCap = Math.min(
      toNumber(limits.subscription.overage_cap_usd || limits.plan.monthly_overage_cap_usd),
      toNumber(limits.plan.monthly_overage_cap_usd)
    )

    if (overageCap > 0 && projectedOverage > overageCap) {
      return { allowed: false, reason: "billing_overage_cap_reached" }
    }
  }

  if (
    limits.usage.final_exports_used + finalExports >
    limits.plan.included_final_exports
  ) {
    return { allowed: false, reason: "billing_export_limit_reached" }
  }

  return { allowed: true, reason: "allowed" }
}
