import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { UsageEventRecord } from "@/server/database/types"

const usageEventSelection =
  "id, owner_id, project_id, export_id, provider, event_type, units, estimated_cost_usd, metadata, created_at"

export async function listUsageEventsByOwner(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("usage_events")
    .select(usageEventSelection)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list usage events")
  }

  return (data ?? []) as UsageEventRecord[]
}

export async function listUsageEventsByProjectIdForOwner(
  projectId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("usage_events")
    .select(usageEventSelection)
    .eq("project_id", projectId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list project usage events")
  }

  return (data ?? []) as UsageEventRecord[]
}

export async function listUsageEventsByExportIdForOwner(
  exportId: string,
  ownerId: string
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("usage_events")
    .select(usageEventSelection)
    .eq("export_id", exportId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list export usage events")
  }

  return (data ?? []) as UsageEventRecord[]
}
