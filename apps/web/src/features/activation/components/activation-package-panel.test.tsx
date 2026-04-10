import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { getMessages } from "@/lib/i18n/catalog"
import { createTranslator } from "@/lib/i18n/translator"
import type { ActivationPackageRecord } from "@/server/database/types"
import { ActivationPackagePanel } from "./activation-package-panel"

vi.mock("@/features/activation/actions/create-activation-package", () => ({
  createActivationPackageAction: vi.fn()
}))

vi.mock("@/lib/i18n/server", () => ({
  getServerI18n: async () => {
    const locale = "en" as const
    return createTranslator(locale, getMessages(locale))
  }
}))

function createPackage(
  overrides: Partial<ActivationPackageRecord>
): ActivationPackageRecord {
  return {
    asset_bundle_json: {},
    canonical_export_id: "export-1",
    channel: "meta",
    channel_payload_json: {},
    created_at: "2026-04-10T00:00:00.000Z",
    created_by_user_id: "owner-1",
    created_via: "owner_dashboard",
    export_id: "export-1",
    id: "package-1",
    manifest_json: {},
    manifest_version: 1,
    owner_id: "owner-1",
    project_id: "project-1",
    readiness_issues: [],
    readiness_status: "ready",
    render_batch_id: "render-batch-1",
    status: "ready",
    updated_at: "2026-04-10T00:00:00.000Z",
    ...overrides
  }
}

describe("ActivationPackagePanel", () => {
  it("renders channel preparation actions when activation is available", async () => {
    const ui = await ActivationPackagePanel({
      activationEnabled: true,
      exportId: "export-1",
      isEligible: true,
      packages: [createPackage({ channel: "google" })]
    })

    render(ui)

    expect(screen.getByRole("button", { name: /Prepare Meta package/i })).toBeEnabled()
    expect(screen.getByRole("link", { name: /Download manifest/i })).toBeInTheDocument()
  })

  it("shows upgrade messaging when the feature is unavailable", async () => {
    const ui = await ActivationPackagePanel({
      activationEnabled: false,
      exportId: "export-1",
      isEligible: true,
      packages: []
    })

    render(ui)

    expect(
      screen.getByText(
        "Your current plan does not include activation package preparation. Upgrade in Billing and plan."
      )
    ).toBeInTheDocument()
  })
})
