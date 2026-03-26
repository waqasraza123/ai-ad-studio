export const deliveryReminderFocusWorkspaceQueryParam = "focus_workspace_id"

const deliveryWorkspaceAnchorPrefix = "delivery-workspace"

function normalizeWorkspaceId(workspaceId: string) {
  return workspaceId.trim()
}

export function buildDeliveryWorkspaceFocusAnchorId(workspaceId: string) {
  return `${deliveryWorkspaceAnchorPrefix}-${normalizeWorkspaceId(workspaceId)}`
}

export function buildDeliveryReminderDashboardHref(workspaceId: string) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId)
  const searchParams = new URLSearchParams({
    activity: "needs_follow_up",
    status: "active",
    sort: "latest_activity",
    [deliveryReminderFocusWorkspaceQueryParam]: normalizedWorkspaceId
  })

  return `/dashboard/delivery?${searchParams.toString()}#${buildDeliveryWorkspaceFocusAnchorId(
    normalizedWorkspaceId
  )}`
}

export function normalizeFocusedWorkspaceId(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}
