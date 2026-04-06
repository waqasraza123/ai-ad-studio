import { describe, expect, it } from "vitest"
import {
  createAssetPlaceholderSchema,
  createProjectSchema,
  projectBriefSchema
} from "./project-schema"

describe("project schema wording guardrails", () => {
  it("rejects blocked project names", () => {
    const result = createProjectSchema.safeParse({
      name: "Sexy product launch"
    })

    expect(result.success).toBe(false)
  })

  it("rejects blocked brief fields", () => {
    const result = projectBriefSchema.safeParse({
      brandTone: "",
      callToAction: "",
      offerText: "",
      productDescription: "Clean copy",
      productName: "Porn bundle",
      targetAudience: "",
      visualStyle: ""
    })

    expect(result.success).toBe(false)
  })

  it("rejects blocked asset metadata text", () => {
    const result = createAssetPlaceholderSchema.safeParse({
      fileName: "nude-reference.png",
      kind: "product_image",
      mimeType: "image/png",
      projectId: "2e7db184-b2b1-46f9-a1c1-c7606cbb5a3a",
      sizeBytes: 1024
    })

    expect(result.success).toBe(false)
  })

  it("accepts professional inputs", () => {
    const result = createProjectSchema.safeParse({
      name: "Spring launch campaign"
    })

    expect(result.success).toBe(true)
  })
})
