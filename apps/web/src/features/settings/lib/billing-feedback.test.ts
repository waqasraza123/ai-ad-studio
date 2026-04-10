import { describe, expect, it } from "vitest"
import { getBillingFeedbackMessageKey } from "./billing-feedback"

describe("getBillingFeedbackMessageKey", () => {
  it("maps supported billing result query values to message keys", () => {
    expect(getBillingFeedbackMessageKey("success")).toBe(
      "settings.billing.feedback.success"
    )
    expect(getBillingFeedbackMessageKey("cancelled")).toBe(
      "settings.billing.feedback.cancelled"
    )
    expect(getBillingFeedbackMessageKey("portal")).toBe(
      "settings.billing.feedback.portal"
    )
  })

  it("ignores unknown or empty query values", () => {
    expect(getBillingFeedbackMessageKey("")).toBeNull()
    expect(getBillingFeedbackMessageKey("unknown")).toBeNull()
    expect(getBillingFeedbackMessageKey(undefined)).toBeNull()
  })
})
