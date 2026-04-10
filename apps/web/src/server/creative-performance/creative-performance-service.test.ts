import { describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
import {
  CreativePerformanceError,
  creativePerformanceServiceInternals,
  parseManualCreativePerformanceBatchInput,
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

  it("parses batched manual performance rows", () => {
    expect(
      parseManualCreativePerformanceBatchInput({
        activationPackageIds: ["", ""],
        channels: ["meta", "google"],
        clicks: ["20", "12"],
        conversionValueUsd: ["250", "140"],
        conversions: ["5", "3"],
        exportIds: ["export-1", "export-2"],
        externalAccountLabel: "Main ad account",
        impressions: ["1000", "640"],
        metricDates: ["2026-04-10", "2026-04-11"],
        notes: "Imported manually",
        operatorLabel: null,
        ownerId: "owner-1",
        source: "manual_owner",
        spendUsd: ["50", "30"],
        submittedByUserId: "owner-1"
      })
    ).toMatchObject({
      ownerId: "owner-1",
      rows: [
        {
          channel: "meta",
          clicks: 20,
          exportId: "export-1"
        },
        {
          channel: "google",
          clicks: 12,
          exportId: "export-2"
        }
      ]
    })
  })

  it("drops fully blank batch rows and rejects empty submissions", () => {
    expect(() =>
      parseManualCreativePerformanceBatchInput({
        activationPackageIds: [""],
        channels: [""],
        clicks: [""],
        conversionValueUsd: [""],
        conversions: [""],
        exportIds: [""],
        externalAccountLabel: "",
        impressions: [""],
        metricDates: [""],
        notes: "",
        operatorLabel: null,
        ownerId: "owner-1",
        source: "manual_owner",
        spendUsd: [""],
        submittedByUserId: "owner-1"
      })
    ).toThrowError(CreativePerformanceError)
  })

  it("treats a fully blank row as removable in batch parsing", () => {
    expect(
      creativePerformanceServiceInternals.normalizePerformanceRow({
        activationPackageId: "",
        channel: "",
        clicks: "",
        conversionValueUsd: "",
        conversions: "",
        exportId: "",
        impressions: "",
        metricDate: "",
        spendUsd: ""
      })
    ).toBeNull()
  })
})
