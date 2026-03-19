import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
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

export async function getOwnerGuardrails(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("owner_guardrails")
    .select(selection)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error || !data) {
    return defaultOwnerGuardrails(ownerId)
  }

  return data as OwnerGuardrailsRecord
}
