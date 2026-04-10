import { describe, expect, it, vi } from "vitest"

const {
  getBillingPlanCatalogReadiness,
  getWebRuntimeReadiness,
  getWebRuntimeStatus
} = vi.hoisted(() => ({
  getBillingPlanCatalogReadiness: vi.fn(),
  getWebRuntimeReadiness: vi.fn(),
  getWebRuntimeStatus: vi.fn()
}))

vi.mock("@/lib/env", () => ({
  getWebRuntimeReadiness,
  getWebRuntimeStatus
}))

vi.mock("@/server/billing/runtime-readiness", () => ({
  getBillingPlanCatalogReadiness
}))

import { GET } from "./route"

describe("GET /api/health", () => {
  it("reports ok when environment and billing catalog readiness are both healthy", async () => {
    getWebRuntimeReadiness.mockReturnValue({
      publicAppUrlConfigured: true,
      r2Configured: true,
      serviceRoleConfigured: true,
      supabaseAuthConfigured: true
    })
    getWebRuntimeStatus.mockReturnValue("ok")
    getBillingPlanCatalogReadiness.mockResolvedValue({
      activePlanCodes: ["free", "starter", "growth", "scale"],
      error: null,
      missingPlanCodes: [],
      reasonCode: null,
      status: "ok"
    })

    const response = await GET()
    const body = await response.json()

    expect(body.readiness).toEqual({
      billingPlanCatalogReady: true,
      publicAppUrlConfigured: true,
      r2Configured: true,
      serviceRoleConfigured: true,
      supabaseAuthConfigured: true
    })
    expect(body.status).toBe("ok")
  })

  it("reports degraded when billing plan catalog readiness is degraded", async () => {
    getWebRuntimeReadiness.mockReturnValue({
      publicAppUrlConfigured: true,
      r2Configured: true,
      serviceRoleConfigured: true,
      supabaseAuthConfigured: true
    })
    getWebRuntimeStatus.mockReturnValue("ok")
    getBillingPlanCatalogReadiness.mockResolvedValue({
      activePlanCodes: [],
      error: "Failed to list billing plans.",
      missingPlanCodes: ["free", "starter", "growth", "scale"],
      reasonCode: "schema_drift",
      status: "degraded"
    })

    const response = await GET()
    const body = await response.json()

    expect(body.readiness.billingPlanCatalogReady).toBe(false)
    expect(body.status).toBe("degraded")
  })
})
