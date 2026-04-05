import type { SupabaseClient } from "@supabase/supabase-js"
import type { WorkerJobRecord } from "@/repositories/jobs-repository"

type OwnerGuardrails = {
  autoBlockOnBudget: boolean
  maxConcurrentPreviewJobs: number
  maxConcurrentRenderJobs: number
  monthlyOpenAiBudgetUsd: number
  monthlyRunwayBudgetUsd: number
  monthlyTotalBudgetUsd: number
}

type GuardrailDecision = {
  allowed: boolean
  guardrails: OwnerGuardrails
  monthlyOpenAiCost: number
  monthlyRunwayCost: number
  monthlyTotalCost: number
  reason: string
}

const defaultGuardrails: OwnerGuardrails = {
  autoBlockOnBudget: true,
  maxConcurrentPreviewJobs: 3,
  maxConcurrentRenderJobs: 2,
  monthlyOpenAiBudgetUsd: 75,
  monthlyRunwayBudgetUsd: 75,
  monthlyTotalBudgetUsd: 200
}

function startOfCurrentMonthIso() {
  const now = new Date()
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  )
  return start.toISOString()
}

async function loadOwnerGuardrails(
  supabase: SupabaseClient,
  ownerId: string
): Promise<OwnerGuardrails> {
  const { data, error } = await supabase
    .from("owner_guardrails")
    .select(
      "owner_id, monthly_total_budget_usd, monthly_openai_budget_usd, monthly_runway_budget_usd, max_concurrent_render_jobs, max_concurrent_preview_jobs, auto_block_on_budget"
    )
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load owner guardrails")
  }

  if (!data) {
    return defaultGuardrails
  }

  return {
    autoBlockOnBudget: Boolean(data.auto_block_on_budget),
    maxConcurrentPreviewJobs: Number(data.max_concurrent_preview_jobs ?? 1),
    maxConcurrentRenderJobs: Number(data.max_concurrent_render_jobs ?? 1),
    monthlyOpenAiBudgetUsd: Number(data.monthly_openai_budget_usd ?? 0),
    monthlyRunwayBudgetUsd: Number(data.monthly_runway_budget_usd ?? 0),
    monthlyTotalBudgetUsd: Number(data.monthly_total_budget_usd ?? 0)
  }
}

async function loadMonthlyUsageCosts(
  supabase: SupabaseClient,
  ownerId: string
) {
  const { data, error } = await supabase
    .from("usage_events")
    .select("provider, estimated_cost_usd")
    .eq("owner_id", ownerId)
    .gte("created_at", startOfCurrentMonthIso())

  if (error) {
    throw new Error("Failed to load owner usage costs")
  }

  let monthlyOpenAiCost = 0
  let monthlyRunwayCost = 0
  let monthlyTotalCost = 0

  for (const row of data ?? []) {
    const provider = String(row.provider ?? "")
    const cost = Number(row.estimated_cost_usd ?? 0)

    monthlyTotalCost += cost

    if (provider === "openai") {
      monthlyOpenAiCost += cost
    }

    if (provider === "runway") {
      monthlyRunwayCost += cost
    }
  }

  return {
    monthlyOpenAiCost,
    monthlyRunwayCost,
    monthlyTotalCost
  }
}

export async function evaluateOwnerGuardrails(
  supabase: SupabaseClient,
  job: WorkerJobRecord
): Promise<GuardrailDecision> {
  const guardrails = await loadOwnerGuardrails(supabase, job.owner_id)
  const costs = await loadMonthlyUsageCosts(supabase, job.owner_id)

  if (!guardrails.autoBlockOnBudget) {
    return {
      allowed: true,
      guardrails,
      monthlyOpenAiCost: costs.monthlyOpenAiCost,
      monthlyRunwayCost: costs.monthlyRunwayCost,
      monthlyTotalCost: costs.monthlyTotalCost,
      reason: "guardrails_not_enforced"
    }
  }

  if (
    guardrails.monthlyTotalBudgetUsd > 0 &&
    costs.monthlyTotalCost >= guardrails.monthlyTotalBudgetUsd
  ) {
    return {
      allowed: false,
      guardrails,
      monthlyOpenAiCost: costs.monthlyOpenAiCost,
      monthlyRunwayCost: costs.monthlyRunwayCost,
      monthlyTotalCost: costs.monthlyTotalCost,
      reason: "monthly_total_budget_exceeded"
    }
  }

  if (
    guardrails.monthlyOpenAiBudgetUsd > 0 &&
    costs.monthlyOpenAiCost >= guardrails.monthlyOpenAiBudgetUsd
  ) {
    return {
      allowed: false,
      guardrails,
      monthlyOpenAiCost: costs.monthlyOpenAiCost,
      monthlyRunwayCost: costs.monthlyRunwayCost,
      monthlyTotalCost: costs.monthlyTotalCost,
      reason: "monthly_openai_budget_exceeded"
    }
  }

  if (
    guardrails.monthlyRunwayBudgetUsd > 0 &&
    costs.monthlyRunwayCost >= guardrails.monthlyRunwayBudgetUsd
  ) {
    return {
      allowed: false,
      guardrails,
      monthlyOpenAiCost: costs.monthlyOpenAiCost,
      monthlyRunwayCost: costs.monthlyRunwayCost,
      monthlyTotalCost: costs.monthlyTotalCost,
      reason: "monthly_runway_budget_exceeded"
    }
  }

  return {
    allowed: true,
    guardrails,
    monthlyOpenAiCost: costs.monthlyOpenAiCost,
    monthlyRunwayCost: costs.monthlyRunwayCost,
    monthlyTotalCost: costs.monthlyTotalCost,
    reason: "allowed"
  }
}
