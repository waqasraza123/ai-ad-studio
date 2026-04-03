import type { DeliveryReminderSupportFilter } from "./delivery-reminder-support-filter"
import {
  buildDeliveryWorkspaceFocusAnchorId,
  buildDeliveryWorkspaceFollowUpAnchorId
} from "./delivery-reminder-support-links"
import {
  getDeliveryReminderSupportFilterLabel
} from "./delivery-reminder-support-filter"
import type { DeliverySupportActivityFilter } from "./delivery-support-activity-filter"
import {
  getDeliverySupportActivityFilterLabel
} from "./delivery-support-activity-filter"

export type DeliveryInvestigationViewState = {
  activity: string | null
  focusFollowUpForm: boolean
  focusReminderNotificationId: string | null
  focusWorkspaceId: string | null
  reminderSupportFilter: DeliveryReminderSupportFilter
  sort: string | null
  status: string | null
  supportActivityFilter: DeliverySupportActivityFilter
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

function buildDeliveryInvestigationSearchParams(
  state: DeliveryInvestigationViewState
) {
  const searchParams = new URLSearchParams()

  setOptionalSearchParam(searchParams, "activity", state.activity)
  setOptionalSearchParam(searchParams, "status", state.status)
  setOptionalSearchParam(searchParams, "sort", state.sort)
  setOptionalSearchParam(
    searchParams,
    "focus_workspace_id",
    state.focusWorkspaceId
  )
  setOptionalSearchParam(
    searchParams,
    "focus_reminder_notification_id",
    state.focusReminderNotificationId
  )

  if (state.focusFollowUpForm) {
    searchParams.set("focus_follow_up_form", "1")
  }

  if (state.reminderSupportFilter !== "all") {
    searchParams.set(
      "reminder_support_filter",
      state.reminderSupportFilter
    )
  }

  if (state.supportActivityFilter !== "all") {
    searchParams.set(
      "support_activity_filter",
      state.supportActivityFilter
    )
  }

  return searchParams
}

function buildDeliveryInvestigationHash(
  state: DeliveryInvestigationViewState
) {
  if (!state.focusWorkspaceId) {
    return ""
  }

  return state.focusFollowUpForm
    ? `#${buildDeliveryWorkspaceFollowUpAnchorId(state.focusWorkspaceId)}`
    : `#${buildDeliveryWorkspaceFocusAnchorId(state.focusWorkspaceId)}`
}

export function buildDeliveryInvestigationViewHref(
  state: DeliveryInvestigationViewState
) {
  const searchParams = buildDeliveryInvestigationSearchParams(state)
  const search = searchParams.toString()
  const hash = buildDeliveryInvestigationHash(state)

  return search.length > 0
    ? `/dashboard/delivery?${search}${hash}`
    : `/dashboard/delivery${hash}`
}

export function buildDeliveryInvestigationBaseHref(
  state: DeliveryInvestigationViewState
) {
  const searchParams = new URLSearchParams()

  setOptionalSearchParam(searchParams, "activity", state.activity)
  setOptionalSearchParam(searchParams, "status", state.status)
  setOptionalSearchParam(searchParams, "sort", state.sort)

  const search = searchParams.toString()

  return search.length > 0
    ? `/dashboard/delivery?${search}`
    : "/dashboard/delivery"
}

export function buildDeliveryInvestigationFocuslessHref(
  state: DeliveryInvestigationViewState
) {
  const searchParams = new URLSearchParams()

  setOptionalSearchParam(searchParams, "activity", state.activity)
  setOptionalSearchParam(searchParams, "status", state.status)
  setOptionalSearchParam(searchParams, "sort", state.sort)

  if (state.reminderSupportFilter !== "all") {
    searchParams.set(
      "reminder_support_filter",
      state.reminderSupportFilter
    )
  }

  if (state.supportActivityFilter !== "all") {
    searchParams.set(
      "support_activity_filter",
      state.supportActivityFilter
    )
  }

  const search = searchParams.toString()

  return search.length > 0
    ? `/dashboard/delivery?${search}`
    : "/dashboard/delivery"
}

export function hasPinnedDeliveryInvestigationContext(
  state: DeliveryInvestigationViewState
) {
  return (
    state.focusFollowUpForm ||
    Boolean(state.focusReminderNotificationId) ||
    Boolean(state.focusWorkspaceId) ||
    state.reminderSupportFilter !== "all" ||
    state.supportActivityFilter !== "all"
  )
}

export function summarizeDeliveryInvestigationViewState(
  state: DeliveryInvestigationViewState
) {
  const labels: string[] = []

  if (state.supportActivityFilter !== "all") {
    labels.push(
      `Support activity: ${getDeliverySupportActivityFilterLabel(
        state.supportActivityFilter
      )}`
    )
  }

  if (state.reminderSupportFilter !== "all") {
    labels.push(
      `Reminder support: ${getDeliveryReminderSupportFilterLabel(
        state.reminderSupportFilter
      )}`
    )
  }

  if (state.focusWorkspaceId) {
    labels.push(`Focused workspace: ${state.focusWorkspaceId}`)
  }

  if (state.focusFollowUpForm) {
    labels.push("Focused follow-up form")
  }

  if (state.focusReminderNotificationId) {
    labels.push(
      `Focused reminder: ${state.focusReminderNotificationId}`
    )
  }

  return labels
}
