import type { AppMessageKey } from "@/lib/i18n/messages/en"

export function getBillingFeedbackMessageKey(
  value: string | null | undefined
): AppMessageKey | null {
  if (value === "success") {
    return "settings.billing.feedback.success"
  }

  if (value === "cancelled") {
    return "settings.billing.feedback.cancelled"
  }

  if (value === "portal") {
    return "settings.billing.feedback.portal"
  }

  return null
}
