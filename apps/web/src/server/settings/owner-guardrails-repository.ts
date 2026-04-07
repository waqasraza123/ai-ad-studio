import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  getBillingPlanByCode,
  getOwnerSubscription
} from "@/server/billing/billing-service"
import type { OwnerGuardrailsRecord } from "@/server/database/types"

const defaultOwnerGuardrails = (ownerId: string): OwnerGuardrailsRecord => ({
  owner_id: ownerId,
  monthly_total_budget_usd: 200,
  monthly_openai_budget_usd: 75,
  monthly_runway_budget_usd: 75,
  max_concurrent_render_jobs: 2,
  max_concurrent_preview_jobs: 3,
  auto_block_on_budget: true,
  updated_at: new Date(0).toISOString(),
  created_at: new Date(0).toISOString()
})

const selection =
  "owner_id, monthly_total_budget_usd, monthly_openai_budget_usd, monthly_runway_budget_usd, max_concurrent_render_jobs, max_concurrent_preview_jobs, auto_block_on_budget, updated_at, created_at"

export type UpsertOwnerGuardrailsInput = {
  ownerId: string
  monthlyTotalBudgetUsd: number
  monthlyOpenaiBudgetUsd: number
  monthlyRunwayBudgetUsd: number
  maxConcurrentRenderJobs: number
  maxConcurrentPreviewJobs: number
  autoBlockOnBudget: boolean
}

export async function getOwnerGuardrails(ownerId: string) {
  const supabase = await createSupabaseServerClient()
  const subscription = await getOwnerSubscription(ownerId, supabase)
  const plan = await getBillingPlanByCode(subscription.plan_code, supabase)

  const { data, error } = await supabase
    .from("owner_guardrails")
    .select(selection)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error || !data) {
    const fallback = defaultOwnerGuardrails(ownerId)

    return {
      ...fallback,
      max_concurrent_preview_jobs: Math.min(
        fallback.max_concurrent_preview_jobs,
        Number(plan.max_concurrent_preview_jobs),
        3
      ),
      max_concurrent_render_jobs: Math.min(
        fallback.max_concurrent_render_jobs,
        Number(plan.max_concurrent_render_jobs),
        3
      ),
      monthly_openai_budget_usd: Math.min(
        fallback.monthly_openai_budget_usd,
        Number(plan.internal_openai_cost_ceiling_usd)
      ),
      monthly_runway_budget_usd: Math.min(
        fallback.monthly_runway_budget_usd,
        Number(plan.internal_runway_cost_ceiling_usd)
      ),
      monthly_total_budget_usd: Math.min(
        fallback.monthly_total_budget_usd,
        Number(plan.internal_total_cost_ceiling_usd)
      )
    }
  }

  return {
    ...(data as OwnerGuardrailsRecord),
    max_concurrent_preview_jobs: Math.min(
      Number(data.max_concurrent_preview_jobs ?? 1),
      Number(plan.max_concurrent_preview_jobs),
      3
    ),
    max_concurrent_render_jobs: Math.min(
      Number(data.max_concurrent_render_jobs ?? 1),
      Number(plan.max_concurrent_render_jobs),
      3
    ),
    monthly_openai_budget_usd: Math.min(
      Number(data.monthly_openai_budget_usd ?? 0),
      Number(plan.internal_openai_cost_ceiling_usd)
    ),
    monthly_runway_budget_usd: Math.min(
      Number(data.monthly_runway_budget_usd ?? 0),
      Number(plan.internal_runway_cost_ceiling_usd)
    ),
    monthly_total_budget_usd: Math.min(
      Number(data.monthly_total_budget_usd ?? 0),
      Number(plan.internal_total_cost_ceiling_usd)
    )
  } satisfies OwnerGuardrailsRecord
}

export async function upsertOwnerGuardrails(input: UpsertOwnerGuardrailsInput) {
  const supabase = await createSupabaseServerClient()
  const subscription = await getOwnerSubscription(input.ownerId, supabase)
  const plan = await getBillingPlanByCode(subscription.plan_code, supabase)

  const monthlyTotalBudgetUsd = Math.min(
    input.monthlyTotalBudgetUsd,
    Number(plan.internal_total_cost_ceiling_usd)
  )
  const monthlyOpenaiBudgetUsd = Math.min(
    input.monthlyOpenaiBudgetUsd,
    Number(plan.internal_openai_cost_ceiling_usd)
  )
  const monthlyRunwayBudgetUsd = Math.min(
    input.monthlyRunwayBudgetUsd,
    Number(plan.internal_runway_cost_ceiling_usd)
  )
  const maxConcurrentRenderJobs = Math.min(
    input.maxConcurrentRenderJobs,
    Number(plan.max_concurrent_render_jobs),
    3
  )
  const maxConcurrentPreviewJobs = Math.min(
    input.maxConcurrentPreviewJobs,
    Number(plan.max_concurrent_preview_jobs),
    3
  )

  const { data, error } = await supabase
    .from("owner_guardrails")
    .upsert(
      {
        owner_id: input.ownerId,
        monthly_total_budget_usd: monthlyTotalBudgetUsd,
        monthly_openai_budget_usd: monthlyOpenaiBudgetUsd,
        monthly_runway_budget_usd: monthlyRunwayBudgetUsd,
        max_concurrent_render_jobs: maxConcurrentRenderJobs,
        max_concurrent_preview_jobs: maxConcurrentPreviewJobs,
        auto_block_on_budget: input.autoBlockOnBudget
      },
      {
        onConflict: "owner_id"
      }
    )
    .select(selection)
    .single()

  if (error) {
    throw new Error("Failed to update owner guardrails")
  }

  return data as OwnerGuardrailsRecord
}
