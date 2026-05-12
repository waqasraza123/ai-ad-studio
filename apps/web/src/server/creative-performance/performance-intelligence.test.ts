import { describe, expect, it } from "vitest"
import type {
  ActivationPackageRecord,
  CreativePerformanceRecord,
  ExportRecord,
  ProjectRecord,
  RenderBatchRecord
} from "@/server/database/types"
import { buildCreativePerformanceIntelligence } from "./performance-intelligence"

const project: ProjectRecord = {
  brand_kit_id: null,
  canonical_export_id: "export-1",
  created_at: "2026-04-10T00:00:00.000Z",
  id: "project-1",
  name: "Launch",
  owner_id: "owner-1",
  selected_concept_id: "concept-1",
  status: "export_ready",
  template_id: null,
  updated_at: "2026-04-10T00:00:00.000Z"
}

function createExport(overrides: Partial<ExportRecord>): ExportRecord {
  return {
    aspect_ratio: "9:16",
    asset_id: "asset-1",
    concept_id: "concept-1",
    created_at: "2026-04-10T00:00:00.000Z",
    id: "export-1",
    owner_id: "owner-1",
    platform_preset: "instagram_reels",
    preview_asset_id: "preview-1",
    project_id: "project-1",
    render_metadata: {},
    status: "ready",
    updated_at: "2026-04-10T00:00:00.000Z",
    variant_key: "default",
    version: 1,
    ...overrides
  }
}

function createPackage(
  overrides: Partial<ActivationPackageRecord>
): ActivationPackageRecord {
  return {
    activated_at: null,
    asset_bundle_json: {},
    canonical_export_id: "export-1",
    channel: "meta",
    channel_payload_json: {},
    created_at: "2026-04-10T00:00:00.000Z",
    created_by_user_id: "owner-1",
    created_via: "owner_dashboard",
    export_id: "export-1",
    historical_at: null,
    id: "package-1",
    manifest_json: {},
    manifest_version: 1,
    owner_id: "owner-1",
    project_id: "project-1",
    readiness_issues: [],
    readiness_status: "ready",
    render_batch_id: "batch-1",
    status: "ready",
    tracking_notes: null,
    tracking_status: "active",
    updated_at: "2026-04-10T00:00:00.000Z",
    ...overrides
  }
}

function createBatch(overrides: Partial<RenderBatchRecord>): RenderBatchRecord {
  return {
    aspect_ratios: ["9:16"],
    concept_id: "concept-1",
    created_at: "2026-04-10T00:00:00.000Z",
    decided_at: "2026-04-10T00:00:00.000Z",
    export_count: 1,
    finalization_note: null,
    finalized_at: "2026-04-10T00:00:00.000Z",
    finalized_by_owner_id: "owner-1",
    finalized_export_id: "export-1",
    id: "batch-1",
    is_finalized: true,
    job_id: "job-1",
    owner_id: "owner-1",
    platform_preset: "instagram_reels",
    project_id: "project-1",
    review_note: null,
    status: "ready",
    updated_at: "2026-04-10T00:00:00.000Z",
    variant_keys: ["default"],
    winner_export_id: "export-1",
    ...overrides
  }
}

function createRecord(
  overrides: Partial<CreativePerformanceRecord>
): CreativePerformanceRecord {
  return {
    activation_package_id: "package-1",
    angle: "Proof angle",
    aspect_ratio: "9:16",
    brand_tone: "Confident",
    call_to_action: "Shop now",
    canonical_export_id: "export-1",
    channel: "meta",
    clicks: 50,
    concept_id: "concept-1",
    conversion_value_usd: 500,
    conversions: 10,
    cpa: 10,
    cpc: 2,
    created_at: "2026-04-10T00:00:00.000Z",
    ctr: 0.05,
    export_id: "export-1",
    hook: "Proof first",
    id: crypto.randomUUID(),
    impressions: 1000,
    ingestion_batch_id: "ingestion-1",
    metadata_json: {},
    metric_date: "2026-04-10",
    offer_text: "Launch offer",
    owner_id: "owner-1",
    platform_preset: "instagram_reels",
    preview_asset_id: "preview-1",
    project_id: "project-1",
    render_batch_id: "batch-1",
    roas: 5,
    spend_usd: 100,
    target_audience: "Founders",
    variant_key: "default",
    ...overrides
  }
}

describe("buildCreativePerformanceIntelligence", () => {
  it("connects activation tracking, rollups, dimensions, and deterministic insights", () => {
    const intelligence = buildCreativePerformanceIntelligence({
      activationPackages: [createPackage({})],
      exports: [
        createExport({}),
        createExport({
          id: "export-2",
          variant_key: "cta_heavy"
        })
      ],
      project,
      records: [
        createRecord({}),
        createRecord({
          activation_package_id: null,
          canonical_export_id: "export-2",
          clicks: 5,
          conversion_value_usd: 0,
          conversions: 0,
          export_id: "export-2",
          hook: "Discount first",
          id: "record-2",
          impressions: 1000,
          spend_usd: 80
        })
      ],
      renderBatches: [
        createBatch({}),
        createBatch({
          finalized_export_id: "export-2",
          id: "batch-2",
          winner_export_id: "export-2"
        })
      ]
    })

    expect(intelligence.totals.impressions).toBe(2000)
    expect(intelligence.trackingRows.map((row) => row.status)).toContain(
      "active"
    )
    expect(intelligence.trackingRows.map((row) => row.status)).toContain(
      "historical"
    )
    expect(intelligence.topCreatives[0]?.label).toBe("Proof first")
    expect(intelligence.weakCreatives[0]?.id).toBe("export-2")
    expect(intelligence.dimensions.call_to_action[0]?.label).toBe("Shop now")
    expect(intelligence.insights.map((insight) => insight.type)).toContain(
      "best_ctr"
    )
    expect(intelligence.insights.map((insight) => insight.type)).toContain(
      "high_spend_low_conversion"
    )
  })

  it("emits low-signal and retest insights when activated tracking lacks data", () => {
    const intelligence = buildCreativePerformanceIntelligence({
      activationPackages: [
        createPackage({
          id: "active-empty",
          tracking_status: "active"
        }),
        createPackage({
          id: "ready-empty",
          tracking_status: "tracking_ready"
        })
      ],
      exports: [createExport({})],
      project,
      records: [],
      renderBatches: [createBatch({})]
    })

    expect(intelligence.insights.map((insight) => insight.type)).toEqual([
      "low_signal",
      "retest_candidate"
    ])
  })
})
