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
      packages: [createPackage({ channel: "google" })],
      readiness: {
        isEligible: true,
        issues: [],
        status: "ready"
      }
    })

    render(ui)

    expect(screen.getByRole("button", { name: /Prepare Meta package/i })).toBeEnabled()
    expect(screen.getByRole("link", { name: /Download manifest/i })).toBeInTheDocument()
    expect(screen.getByText("Current package")).toBeInTheDocument()
  })

  it("shows upgrade messaging when the feature is unavailable", async () => {
    const ui = await ActivationPackagePanel({
      activationEnabled: false,
      exportId: "export-1",
      packages: [],
      readiness: {
        isEligible: false,
        issues: ["render_batch_not_finalized"],
        status: "blocked"
      }
    })

    render(ui)

    expect(
      screen.getByText(
        "Your current plan does not include activation package preparation. Upgrade in Billing and plan."
      )
    ).toBeInTheDocument()
  })

  it("renders translated readiness blockers", async () => {
    const ui = await ActivationPackagePanel({
      activationEnabled: true,
      exportId: "export-1",
      packages: [createPackage({ readiness_issues: ["export_not_canonical"], status: "draft" })],
      readiness: {
        isEligible: false,
        issues: ["render_batch_not_finalized", "export_not_canonical"],
        status: "blocked"
      }
    })

    render(ui)

    expect(screen.getByText("This export still needs readiness fixes before a new package can be prepared.")).toBeInTheDocument()
    expect(screen.getByText("The review batch is not finalized yet.")).toBeInTheDocument()
    expect(screen.getAllByText("This export is not the current canonical winner.").length).toBeGreaterThan(0)
  })
})
