import { describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
import {
  CreativePerformanceError,
  creativePerformanceServiceInternals,
  parseManualCreativePerformanceInput
} from "./creative-performance-service"

describe("creative performance service", () => {
  it("derives CTR, CPC, CPA, and ROAS from base metrics", () => {
    expect(
      creativePerformanceServiceInternals.deriveMetrics({
        clicks: 40,
        conversionValueUsd: 500,
        conversions: 8,
        impressions: 2000,
        spendUsd: 100
      })
    ).toEqual({
      cpa: 12.5,
      cpc: 2.5,
      ctr: 0.02,
      roas: 5
    })
  })

  it("parses valid manual performance input", () => {
    expect(
      parseManualCreativePerformanceInput({
        channel: "meta",
        clicks: "20",
        conversionValueUsd: "250",
        conversions: "5",
        exportId: "export-1",
        externalAccountLabel: "Main ad account",
        impressions: "1000",
        metricDate: "2026-04-10",
        notes: "Imported manually",
        operatorLabel: null,
        ownerId: "owner-1",
        source: "manual_owner",
        spendUsd: "50",
        submittedByUserId: "owner-1"
      })
    ).toMatchObject({
      channel: "meta",
      clicks: 20,
      conversionValueUsd: 250,
      conversions: 5,
      exportId: "export-1",
      impressions: 1000,
      metricDate: "2026-04-10",
      ownerId: "owner-1",
      spendUsd: 50
    })
  })

  it("rejects invalid owner-scoped payloads", () => {
    expect(() =>
      parseManualCreativePerformanceInput({
        channel: "meta",
        clicks: "1",
        conversionValueUsd: "1",
        conversions: "1",
        exportId: "export-1",
        externalAccountLabel: "",
        impressions: "10",
        metricDate: "2026/04/10",
        notes: "",
        operatorLabel: null,
        ownerId: "",
        source: "manual_owner",
        spendUsd: "1",
        submittedByUserId: "owner-1"
      })
    ).toThrowError(CreativePerformanceError)
  })
})
