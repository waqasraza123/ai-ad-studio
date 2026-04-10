import { describe, expect, it } from "vitest"
import type { CreativePerformanceRecord } from "@/server/database/types"
import { buildCreativePerformanceSummary } from "./creative-performance-summary"

function createRecord(
  overrides: Partial<CreativePerformanceRecord>
): CreativePerformanceRecord {
  return {
    activation_package_id: null,
    angle: "Offer angle",
    aspect_ratio: "9:16",
    brand_tone: "Premium",
    call_to_action: "Shop now",
    canonical_export_id: "export-canonical-1",
    channel: "meta",
    clicks: 20,
    concept_id: "concept-1",
    conversion_value_usd: 250,
    conversions: 5,
    cpa: 2,
    cpc: 0.5,
    created_at: "2026-04-10T00:00:00.000Z",
    ctr: 0.02,
    export_id: "export-1",
    hook: "Glow in one pass",
    id: crypto.randomUUID(),
    impressions: 1000,
    ingestion_batch_id: "batch-1",
    metadata_json: {},
    metric_date: "2026-04-10",
    offer_text: "20 percent off",
    owner_id: "owner-1",
    platform_preset: "instagram_reels",
    preview_asset_id: "preview-1",
    project_id: "project-1",
    render_batch_id: "render-batch-1",
    roas: 5,
    spend_usd: 50,
    target_audience: "Skincare buyers",
    variant_key: "default",
    ...overrides
  }
}

describe("buildCreativePerformanceSummary", () => {
  it("aggregates totals and grouped creative breakdowns", () => {
    const summary = buildCreativePerformanceSummary([
      createRecord({}),
      createRecord({
        call_to_action: "Start today",
        clicks: 10,
        conversion_value_usd: 120,
        conversions: 2,
        export_id: "export-2",
        hook: "Clinical results fast",
        id: "row-2",
        impressions: 500,
        spend_usd: 25
      })
    ])

    expect(summary.totals.impressions).toBe(1500)
    expect(summary.totals.clicks).toBe(30)
    expect(summary.totals.spendUsd).toBe(75)
    expect(summary.totals.conversions).toBe(7)
    expect(summary.topExports).toHaveLength(1)
    expect(summary.byHook[0]?.label).toBe("Glow in one pass")
    expect(summary.byCallToAction.map((row) => row.label)).toEqual(["Shop now", "Start today"])
    expect(summary.byAspectRatio[0]?.label).toBe("9:16")
  })
})
