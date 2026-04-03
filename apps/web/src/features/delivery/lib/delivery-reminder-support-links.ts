import type { DeliveryReminderSupportFilter } from "./delivery-reminder-support-filter"
import type { DeliverySupportActivityFilter } from "./delivery-support-activity-filter"

export const deliveryReminderFocusWorkspaceQueryParam = "focus_workspace_id"
export const deliveryReminderSupportFilterQueryParam =
  "reminder_support_filter"
export const deliveryReminderFollowUpFormFocusQueryParam =
  "focus_follow_up_form"
export const deliveryReminderNotificationIdQueryParam =
  "focus_reminder_notification_id"
export const deliverySupportActivityFilterQueryParam =
  "support_activity_filter"

const deliveryWorkspaceAnchorPrefix = "delivery-workspace"

type DeliveryReminderDashboardSearchParams = {
  activity?: string | null
  focusFollowUpForm?: boolean | null
  focusReminderNotificationId?: string | null
  focusWorkspaceId?: string | null
  reminderSupportFilter?: DeliveryReminderSupportFilter | null
  sort?: string | null
  status?: string | null
  supportActivityFilter?: DeliverySupportActivityFilter | null
}

function normalizeWorkspaceId(workspaceId: string) {
  return workspaceId.trim()
}

function normalizeNotificationId(notificationId: string) {
  return notificationId.trim()
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

  if (input.focusFollowUpForm) {
    searchParams.set(deliveryReminderFollowUpFormFocusQueryParam, "1")
  }

  setOptionalSearchParam(
    searchParams,
    deliveryReminderNotificationIdQueryParam,
    input.focusReminderNotificationId
  )

  if (input.reminderSupportFilter && input.reminderSupportFilter !== "all") {
    searchParams.set(
      deliveryReminderSupportFilterQueryParam,
      input.reminderSupportFilter
    )
  }

  if (input.supportActivityFilter && input.supportActivityFilter !== "all") {
    searchParams.set(
      deliverySupportActivityFilterQueryParam,
      input.supportActivityFilter
    )
  }

  return searchParams
}

export function buildDeliveryWorkspaceFocusAnchorId(workspaceId: string) {
  return `${deliveryWorkspaceAnchorPrefix}-${normalizeWorkspaceId(workspaceId)}`
}

export function buildDeliveryWorkspaceFollowUpAnchorId(workspaceId: string) {
  return `${buildDeliveryWorkspaceFocusAnchorId(workspaceId)}-follow-up`
}

export function buildDeliveryReminderDashboardHref(
  workspaceId: string,
  input?: {
    reminderSupportFilter?: DeliveryReminderSupportFilter | null
    supportActivityFilter?: DeliverySupportActivityFilter | null
  }
) {
  const normalizedWorkspaceId = normalizeWorkspaceId(workspaceId)
  const searchParams = buildDashboardSearchParams({
    activity: "needs_follow_up",
    focusWorkspaceId: normalizedWorkspaceId,
    reminderSupportFilter: input?.reminderSupportFilter ?? null,
    sort: "latest_activity",
    status: "active",
    supportActivityFilter: input?.supportActivityFilter ?? null
  })

  return `/dashboard/delivery?${searchParams.toString()}#${buildDeliveryWorkspaceFocusAnchorId(
    normalizedWorkspaceId
  )}`
}

export function buildDeliveryReminderFollowUpFormHref(input: {
  notificationId: string
  reminderSupportFilter?: DeliveryReminderSupportFilter | null
  supportActivityFilter?: DeliverySupportActivityFilter | null
  workspaceId: string
}) {
  const normalizedWorkspaceId = normalizeWorkspaceId(input.workspaceId)
  const normalizedNotificationId = normalizeNotificationId(input.notificationId)

  const searchParams = buildDashboardSearchParams({
    activity: "needs_follow_up",
    focusFollowUpForm: true,
    focusReminderNotificationId: normalizedNotificationId,
    focusWorkspaceId: normalizedWorkspaceId,
    reminderSupportFilter: input.reminderSupportFilter ?? null,
    sort: "latest_activity",
    status: "active",
    supportActivityFilter: input.supportActivityFilter ?? null
  })

  return `/dashboard/delivery?${searchParams.toString()}#${buildDeliveryWorkspaceFollowUpAnchorId(
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

export function buildDeliverySupportActivityFilterHref(
  input: DeliveryReminderDashboardSearchParams & {
    supportActivityFilter: DeliverySupportActivityFilter
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

export function normalizeFollowUpFormFocus(value: string | null | undefined) {
  if (typeof value !== "string") {
    return false
  }

  const normalizedValue = value.trim().toLowerCase()

  return normalizedValue === "1" || normalizedValue === "true"
}

export function normalizeFocusedReminderNotificationId(
  value: string | null | undefined
) {
  if (typeof value !== "string") {
    return null
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}
