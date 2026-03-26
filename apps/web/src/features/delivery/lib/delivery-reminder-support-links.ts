import type { DeliveryReminderSupportFilter } from "./delivery-reminder-support-filter"

export const deliveryReminderFocusWorkspaceQueryParam = "focus_workspace_id"
export const deliveryReminderSupportFilterQueryParam =
  "reminder_support_filter"

const deliveryWorkspaceAnchorPrefix = "delivery-workspace"

type DeliveryReminderDashboardSearchParams = {
  activity?: string | null
  focusWorkspaceId?: string | null
  reminderSupportFilter?: DeliveryReminderSupportFilter | null
  sort?: string | null
  status?: string | null
}

function normalizeWorkspaceId(workspaceId: string) {
  return workspaceId.trim()
}

function setOptionalSearchParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | null | undefined
) {
  if (!value) {
    return
  }

  searchParams.set(key, value)
}

function buildDashboardSearchParams(input: DeliveryReminderDashboardSearchParams) {
  const searchParams = new URLSearchParams()

  setOptionalSearchParam(searchParams, "activity", input.activity)
  setOptionalSearchParam(searchParams, "status", input.status)
  setOptionalSearchParam(searchParams, "sort", input.sort)
  setOptionalSearchParam(
    searchParams,
    deliveryReminderFocusWorkspaceQueryParam,
    input.focusWorkspaceId
  )

  if (
    input.reminderSupportFilter &&
    input.reminderSupportFilter !== "all"
  ) {
    searchParams.set(
      deliveryReminderSupportFilterQueryParam,
      input.reminderSupportFilter
    )
  }

  return searchParams
}

export function buildDeliveryWorkspaceFocusAnchorId(workspaceId: string) {
  return `${deliveryWorkspaceAnchorPrefix}-${normalizeWorkspaceId(workspaceId)}`
}

export function buildDeliveryReminderDashboardHref(
  workspaceId: string,
  input?: {
    reminderSupportFilter?: DeliveryReminderSupportFilter | null
  }
) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId)
  const searchParams = buildDashboardSearchParams({
    activity: "needs_follow_up",
    focusWorkspaceId: normalizedWorkspaceId,
    reminderSupportFilter: input?.reminderSupportFilter ?? null,
    sort: "latest_activity",
    status: "active"
  })

  return `/dashboard/delivery?${searchParams.toString()}#${buildDeliveryWorkspaceFocusAnchorId(
    normalizedWorkspaceId
  )}`
}

export function buildDeliveryReminderSupportFilterHref(
  input: DeliveryReminderDashboardSearchParams & {
    reminderSupportFilter: DeliveryReminderSupportFilter
  }
) {
  const searchParams = buildDashboardSearchParams(input)
  const serializedSearchParams = searchParams.toString()

  return serializedSearchParams.length > 0
    ? `/dashboard/delivery?${serializedSearchParams}`
    : "/dashboard/delivery"
}

export function normalizeFocusedWorkspaceId(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}
