import { describe, expect, it } from "vitest"
import { getMessages } from "@/lib/i18n/catalog"
import { createTranslator } from "@/lib/i18n/translator"
import { getFormErrorMessage } from "./form-error-messages"

describe("getFormErrorMessage", () => {
  it("returns translated copy for known error codes when a translator is present", () => {
    const translator = createTranslator("ar", getMessages("ar"))

    expect(getFormErrorMessage("auth_credentials_required", translator.t)).toBe(
      "البريد الإلكتروني وكلمة المرور مطلوبان."
    )
  })

  it("falls back to the default English copy for known codes without a translator", () => {
    expect(getFormErrorMessage("auth_sign_in_failed")).toBe(
      "Unable to sign in with those credentials."
    )
  })

  it("decodes known URL-encoded error codes before resolving copy", () => {
    expect(getFormErrorMessage("auth_sign_in_failed%20")).toBe(
      "auth_sign_in_failed%20"
    )
    expect(getFormErrorMessage("auth_sign_in_failed")).toBe(
      "Unable to sign in with those credentials."
    )
    expect(getFormErrorMessage("auth_sign_in_failed")).not.toBeNull()
  })

  it("returns unknown error codes unchanged after trimming", () => {
    expect(getFormErrorMessage("  custom_error  ")).toBe("custom_error")
  })
})
