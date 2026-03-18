import type { SupabaseClient } from "@supabase/supabase-js"

export type UsageEventInsertRecord = {
  owner_id: string
  project_id: string
  export_id?: string | null
  provider: string
  event_type: string
  units: number
  estimated_cost_usd: number
  metadata: Record<string, unknown>
}

export async function createUsageEvents(
  supabase: SupabaseClient,
  usageEvents: UsageEventInsertRecord[]
) {
  if (usageEvents.length === 0) {
    return
  }

  const { error } = await supabase.from("usage_events").insert(usageEvents)

  if (error) {
    throw new Error("Failed to create usage events")
  }
}
