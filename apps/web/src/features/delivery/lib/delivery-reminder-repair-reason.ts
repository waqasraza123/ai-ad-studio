import { validateModestText } from "../../../lib/modest-wording/index"

export const deliveryReminderClearReasonFieldName = "clearReminderReason"
export const deliveryReminderClearReasonMaxLength = 280

export type DeliveryReminderClearReasonValidationError =
  | "disallowed_wording"
  | "reason_required"
  | "reason_too_long"

export function normalizeDeliveryReminderClearReason(
  value: FormDataEntryValue | null | undefined
) {
  if (typeof value !== "string") {
    return null
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

export function validateDeliveryReminderClearReason(
  value: string | null
): DeliveryReminderClearReasonValidationError | null {
  if (!value) {
    return "reason_required"
  }

  if (value.length > deliveryReminderClearReasonMaxLength) {
    return "reason_too_long"
  }

  if (validateModestText(value)) {
    return "disallowed_wording"
  }

  return null
}
