import { createSupabaseServerClient } from "@/lib/supabase/server"

const deliveryReminderNotificationKinds = [
  "delivery_follow_up_due_today",
  "delivery_follow_up_overdue"
] as const

export type DeliveryReminderNotificationKind =
  (typeof deliveryReminderNotificationKinds)[number]

export type DeliveryReminderNotificationRecord = {
  body: string
  created_at: string
  id: string
  kind: DeliveryReminderNotificationKind
  metadata: unknown
  title: string
}

type RawDeliveryReminderNotificationRecord = {
  body: string | null
  created_at: string
  id: string
  kind: string
  metadata: unknown
  title: string | null
}

function isDeliveryReminderNotificationKind(
  value: string
): value is DeliveryReminderNotificationKind {
  return deliveryReminderNotificationKinds.includes(
    value as DeliveryReminderNotificationKind
  )
}

function normalizeLimit(limit: number | undefined) {
  if (!Number.isInteger(limit) || !limit || limit <= 0) {
    return 8
  }

  return Math.min(limit, 20)
}

export async function listRecentDeliveryReminderNotificationsByOwner(
  ownerId: string,
  limit?: number
) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("notifications")
    .select("id, kind, title, body, metadata, created_at")
    .eq("owner_id", ownerId)
    .in("kind", [...deliveryReminderNotificationKinds])
    .order("created_at", { ascending: false })
    .limit(normalizeLimit(limit))

  if (error) {
    throw new Error("Failed to load recent delivery reminder notifications")
  }

  return ((data ?? []) as RawDeliveryReminderNotificationRecord[]).flatMap(
    (record) => {
      if (!isDeliveryReminderNotificationKind(record.kind)) {
        return []
      }

      return [
        {
          body: record.body ?? "",
          created_at: record.created_at,
          id: record.id,
          kind: record.kind,
          metadata: record.metadata ?? null,
          title: record.title ?? ""
        } satisfies DeliveryReminderNotificationRecord
      ]
    }
  )
}
