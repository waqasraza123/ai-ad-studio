import { describe, expect, it } from "vitest"
import {
  containsDisallowedWording,
  DISALLOWED_WORDING_VALIDATION_ERROR,
  modestZodString,
  validateModestText,
  validateRecordTextFields
} from "./index"

describe("containsDisallowedWording", () => {
  it("blocks direct disallowed wording", () => {
    expect(containsDisallowedWording("This includes porn content")).toBe(true)
  })

  it("blocks mixed-case wording", () => {
    expect(containsDisallowedWording("Keep this SeXy headline")).toBe(true)
  })

  it("blocks simple separator evasion", () => {
    expect(containsDisallowedWording("s-e-x")).toBe(true)
    expect(containsDisallowedWording("p_o_r_n")).toBe(true)
    expect(containsDisallowedWording("f.u.c.k")).toBe(true)
  })

  it("allows normal professional wording", () => {
    expect(
      containsDisallowedWording(
        "Launch a clean product campaign for a summer sale."
      )
    ).toBe(false)
  })
})

describe("validation helpers", () => {
  it("returns the shared error code for blocked wording", () => {
    expect(validateModestText("sexy")).toBe(DISALLOWED_WORDING_VALIDATION_ERROR)
  })

  it("returns null for valid wording", () => {
    expect(validateModestText("Professional launch plan")).toBeNull()
  })

  it("checks every record field", () => {
    expect(
      validateRecordTextFields({
        name: "Professional campaign",
        summary: "clean copy",
        title: "s e x"
      })
    ).toBe(DISALLOWED_WORDING_VALIDATION_ERROR)
  })
})

describe("modestZodString", () => {
  it("fails parsing with the shared error code", () => {
    const schema = modestZodString(z.string())
    const result = schema.safeParse("porn")

    expect(result.success).toBe(false)

    if (result.success) {
      throw new Error("Expected parsing to fail")
    }

    expect(result.error.issues[0]?.message).toBe(
      DISALLOWED_WORDING_VALIDATION_ERROR
    )
  })
})
