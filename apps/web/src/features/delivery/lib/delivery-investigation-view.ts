import type { DeliveryReminderMismatchLifecycleFilter } from "./delivery-reminder-mismatch-lifecycle-filter"
import type { AppMessageKey } from "@/lib/i18n/messages/en"
import {
  getDeliveryReminderMismatchLifecycleFilterLabel,
  getDeliveryReminderMismatchLifecycleFilterLabelKey
} from "./delivery-reminder-mismatch-lifecycle-filter"
import type { DeliveryReminderSupportFilter } from "./delivery-reminder-support-filter"
import {
  buildDeliveryWorkspaceFocusAnchorId,
  buildDeliveryWorkspaceFollowUpAnchorId
} from "./delivery-reminder-support-links"
import {
  getDeliveryReminderSupportFilterLabel,
  getDeliveryReminderSupportFilterLabelKey
} from "./delivery-reminder-support-filter"
import type { DeliverySupportActivityFilter } from "./delivery-support-activity-filter"
import {
  getDeliverySupportActivityFilterLabel,
  getDeliverySupportActivityFilterLabelKey
} from "./delivery-support-activity-filter"

type Translate = (
  key: AppMessageKey,
  values?: Record<string, string | number | null | undefined>
) => string

export type DeliveryInvestigationViewState = {
  activity: string | null
  focusFollowUpForm: boolean
  focusReminderNotificationId: string | null
  focusWorkspaceId: string | null
  reminderMismatchLifecycleFilter: DeliveryReminderMismatchLifecycleFilter
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

  if (state.reminderMismatchLifecycleFilter !== "all") {
    searchParams.set(
      "reminder_mismatch_lifecycle_filter",
      state.reminderMismatchLifecycleFilter
    )
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

  if (state.reminderMismatchLifecycleFilter !== "all") {
    searchParams.set(
      "reminder_mismatch_lifecycle_filter",
      state.reminderMismatchLifecycleFilter
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
    state.reminderMismatchLifecycleFilter !== "all" ||
    state.reminderSupportFilter !== "all" ||
    state.supportActivityFilter !== "all"
  )
}

export function summarizeDeliveryInvestigationViewState(
  state: DeliveryInvestigationViewState,
  t?: Translate
) {
  const labels: string[] = []

  if (state.supportActivityFilter !== "all") {
    labels.push(
      t
        ? t("delivery.investigationView.summary.supportActivity", {
            value: t(
              getDeliverySupportActivityFilterLabelKey(
                state.supportActivityFilter
              )
            )
          })
        : `Support activity: ${getDeliverySupportActivityFilterLabel(
            state.supportActivityFilter
          )}`
    )
  }

  if (state.reminderMismatchLifecycleFilter !== "all") {
    labels.push(
      t
        ? t("delivery.investigationView.summary.mismatchLifecycle", {
            value: t(
              getDeliveryReminderMismatchLifecycleFilterLabelKey(
                state.reminderMismatchLifecycleFilter
              )
            )
          })
        : `Mismatch lifecycle: ${getDeliveryReminderMismatchLifecycleFilterLabel(
            state.reminderMismatchLifecycleFilter
          )}`
    )
  }

  if (state.reminderSupportFilter !== "all") {
    labels.push(
      t
        ? t("delivery.investigationView.summary.reminderSupport", {
            value: t(
              getDeliveryReminderSupportFilterLabelKey(
                state.reminderSupportFilter
              )
            )
          })
        : `Reminder support: ${getDeliveryReminderSupportFilterLabel(
            state.reminderSupportFilter
          )}`
    )
  }

  if (state.focusWorkspaceId) {
    labels.push(
      t
        ? t("delivery.investigationView.summary.focusedWorkspace", {
            value: state.focusWorkspaceId
          })
        : `Focused workspace: ${state.focusWorkspaceId}`
    )
  }

  if (state.focusFollowUpForm) {
    labels.push(
      t
        ? t("delivery.investigationView.summary.focusedFollowUpForm")
        : "Focused follow-up form"
    )
  }

  if (state.focusReminderNotificationId) {
    labels.push(
      t
        ? t("delivery.investigationView.summary.focusedReminder", {
            value: state.focusReminderNotificationId
          })
        : `Focused reminder: ${state.focusReminderNotificationId}`
    )
  }

  return labels
}
