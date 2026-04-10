import { describe, expect, it } from "vitest"
import type {
  BillingPlanRecord,
  ShowcaseItemRecord
} from "@/server/database/types"
import {
  mapHomepageFeaturedShowcaseItems,
  mapHomepagePricingPlans
} from "./homepage-data"
import { createTranslator } from "@/lib/i18n/translator"
import { en } from "@/lib/i18n/messages/en"

const i18n = createTranslator("en", en)

function buildShowcaseItem(
  overrides: Partial<ShowcaseItemRecord> & {
    aspect_ratio?: string | null
    platform_preset?: string | null
    template_name?: string | null
    preview_data_url?: string | null
  }
): ShowcaseItemRecord {
  return {
    created_at: overrides.created_at ?? "2026-04-08T00:00:00.000Z",
    export_id: overrides.export_id ?? crypto.randomUUID(),
    id: overrides.id ?? crypto.randomUUID(),
    is_published: overrides.is_published ?? true,
    owner_id: overrides.owner_id ?? "owner-1",
    project_id: overrides.project_id ?? "project-1",
    render_batch_id: overrides.render_batch_id ?? "batch-1",
    sort_order: overrides.sort_order ?? 0,
    summary: overrides.summary ?? "Summary",
    title: overrides.title ?? "Title",
    updated_at: overrides.updated_at ?? "2026-04-08T00:00:00.000Z",
    ...(overrides.aspect_ratio ? { aspect_ratio: overrides.aspect_ratio } : {}),
    ...(overrides.platform_preset
      ? { platform_preset: overrides.platform_preset }
      : {}),
    ...(overrides.template_name
      ? { template_name: overrides.template_name }
      : {}),
    ...(overrides.preview_data_url
      ? { preview_data_url: overrides.preview_data_url }
      : {})
  } as ShowcaseItemRecord
}

function buildPlan(overrides: Partial<BillingPlanRecord>): BillingPlanRecord {
  return {
    allow_activation_packages: overrides.allow_activation_packages ?? false,
    allow_creative_performance_analytics:
      overrides.allow_creative_performance_analytics ?? false,
    allow_creative_performance_ingestion:
      overrides.allow_creative_performance_ingestion ?? false,
    allow_delivery_workspaces: overrides.allow_delivery_workspaces ?? false,
    allow_external_batch_reviews:
      overrides.allow_external_batch_reviews ?? false,
    allow_manual_invoice: overrides.allow_manual_invoice ?? false,
    allow_overage: overrides.allow_overage ?? false,
    allow_public_showcase: overrides.allow_public_showcase ?? false,
    allow_share_campaigns: overrides.allow_share_campaigns ?? false,
    allow_share_links: overrides.allow_share_links ?? true,
    code: overrides.code ?? "free",
    concept_run_overage_usd: overrides.concept_run_overage_usd ?? 0,
    created_at: overrides.created_at ?? "2026-04-08T00:00:00.000Z",
    display_name: overrides.display_name ?? "Free",
    included_active_projects: overrides.included_active_projects ?? 1,
    included_concept_runs: overrides.included_concept_runs ?? 1,
    included_final_exports: overrides.included_final_exports ?? 1,
    included_preview_generations: overrides.included_preview_generations ?? 1,
    included_render_batches: overrides.included_render_batches ?? 1,
    included_storage_bytes: overrides.included_storage_bytes ?? 1,
    internal_openai_cost_ceiling_usd:
      overrides.internal_openai_cost_ceiling_usd ?? 0,
    internal_runway_cost_ceiling_usd:
      overrides.internal_runway_cost_ceiling_usd ?? 0,
    internal_total_cost_ceiling_usd:
      overrides.internal_total_cost_ceiling_usd ?? 0,
    is_active: overrides.is_active ?? true,
    max_concurrent_preview_jobs: overrides.max_concurrent_preview_jobs ?? 1,
    max_concurrent_render_jobs: overrides.max_concurrent_render_jobs ?? 1,
    monthly_overage_cap_usd: overrides.monthly_overage_cap_usd ?? 0,
    monthly_price_usd: overrides.monthly_price_usd ?? 0,
    preview_generation_overage_usd:
      overrides.preview_generation_overage_usd ?? 0,
    render_batch_overage_usd: overrides.render_batch_overage_usd ?? 0,
    sort_order: overrides.sort_order ?? 0,
    storage_gb_month_overage_usd: overrides.storage_gb_month_overage_usd ?? 0,
    updated_at: overrides.updated_at ?? "2026-04-08T00:00:00.000Z",
    watermark_exports: overrides.watermark_exports ?? false
  }
}

describe("mapHomepageFeaturedShowcaseItems", () => {
  it("limits homepage featured showcase items and derives tags", () => {
    const result = mapHomepageFeaturedShowcaseItems([
      buildShowcaseItem({
        aspect_ratio: "9:16",
        id: "item-1",
        platform_preset: "instagram_reels",
        preview_data_url: "https://example.com/preview-1.jpg",
        summary: "First summary",
        template_name: "Premium Cinematic",
        title: "First title"
      }),
      buildShowcaseItem({
        id: "item-2",
        summary: "Second summary",
        title: "Second title"
      }),
      buildShowcaseItem({
        id: "item-3",
        summary: "Third summary",
        title: "Third title"
      }),
      buildShowcaseItem({
        id: "item-4",
        summary: "Fourth summary",
        title: "Fourth title"
      })
    ])

    expect(result).toEqual([
      {
        href: "/showcase",
        id: "item-1",
        imageUrl: "https://example.com/preview-1.jpg",
        summary: "First summary",
        tags: ["9:16", "instagram_reels", "Premium Cinematic"],
        title: "First title"
      },
      {
        href: "/showcase",
        id: "item-2",
        imageUrl: null,
        summary: "Second summary",
        tags: [],
        title: "Second title"
      },
      {
        href: "/showcase",
        id: "item-3",
        imageUrl: null,
        summary: "Third summary",
        tags: [],
        title: "Third title"
      }
    ])
  })

  it("returns an empty array when there are no showcase items", () => {
    expect(mapHomepageFeaturedShowcaseItems([])).toEqual([])
  })
})

describe("mapHomepagePricingPlans", () => {
  it("sorts plans by sort order and builds concise pricing labels", () => {
    const result = mapHomepagePricingPlans(
      [
        buildPlan({
          allow_delivery_workspaces: true,
          allow_public_showcase: true,
          allow_share_campaigns: true,
          code: "growth",
          display_name: "Growth",
          included_final_exports: 12,
          included_preview_generations: 60,
          included_render_batches: 24,
          monthly_price_usd: 99,
          sort_order: 2
        }),
        buildPlan({
          code: "free",
          display_name: "Free",
          included_final_exports: 1,
          included_preview_generations: 3,
          included_render_batches: 1,
          monthly_price_usd: 0,
          sort_order: 0
        }),
        buildPlan({
          allow_delivery_workspaces: true,
          code: "starter",
          display_name: "Starter",
          included_final_exports: 4,
          included_preview_generations: 20,
          included_render_batches: 8,
          monthly_price_usd: 39,
          sort_order: 1
        })
      ],
      i18n
    )

    expect(result).toEqual([
      {
        code: "free",
        conceptsLabel: "1 concepts / month",
        exportsLabel: "1 exports / month",
        name: "Free",
        previewsLabel: "3 previews / month",
        priceLabel: "Free",
        publishingLabel: "Internal workflow only",
        rendersLabel: "1 render batches / month"
      },
      {
        code: "starter",
        conceptsLabel: "1 concepts / month",
        exportsLabel: "4 exports / month",
        name: "Starter",
        previewsLabel: "20 previews / month",
        priceLabel: "$39/mo",
        publishingLabel: "Delivery publishing included",
        rendersLabel: "8 render batches / month"
      },
      {
        code: "growth",
        conceptsLabel: "1 concepts / month",
        exportsLabel: "12 exports / month",
        name: "Growth",
        previewsLabel: "60 previews / month",
        priceLabel: "$99/mo",
        publishingLabel: "Showcase, campaign, and delivery publishing",
        rendersLabel: "24 render batches / month"
      }
    ])
  })
})
