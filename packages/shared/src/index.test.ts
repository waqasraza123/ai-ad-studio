import { describe, expect, it } from "vitest"
import {
  applicationName,
  supportedAspectRatio,
  supportedDurationSeconds
} from "./index"

describe("shared", () => {
  it("exposes core constants", () => {
    expect(applicationName).toBe("AI Ad Studio")
    expect(supportedAspectRatio).toBe("9:16")
    expect(supportedDurationSeconds).toBe(10)
  })
})
