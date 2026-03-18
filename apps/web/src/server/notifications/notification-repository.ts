import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { NotificationRecord } from "@/server/database/types"

const notificationSelection =
  "id, owner_id, project_id, export_id, job_id, kind, title, body, severity, action_url, metadata, read_at, created_at"

export async function listNotificationsByOwner(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("notifications")
    .select(notificationSelection)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list notifications")
  }

  return (data ?? []) as NotificationRecord[]
}

export async function listUnreadNotificationsByOwner(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("notifications")
    .select(notificationSelection)
    .eq("owner_id", ownerId)
    .is("read_at", null)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to list unread notifications")
  }

  return (data ?? []) as NotificationRecord[]
}

export async function markNotificationAsRead(input: {
  notificationId: string
  ownerId: string
}) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("notifications")
    .update({
      read_at: new Date().toISOString()
    })
    .eq("id", input.notificationId)
    .eq("owner_id", input.ownerId)

  if (error) {
    throw new Error("Failed to mark notification as read")
  }
}

export async function markAllNotificationsAsRead(ownerId: string) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("notifications")
    .update({
      read_at: new Date().toISOString()
    })
    .eq("owner_id", ownerId)
    .is("read_at", null)

  if (error) {
    throw new Error("Failed to mark all notifications as read")
  }
}
