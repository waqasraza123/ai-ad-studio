import type {
  BillingPlanCode,
  BillingPlanRecord,
  ShowcaseItemRecord
} from "@/server/database/types"

type ShowcaseGalleryItem = ShowcaseItemRecord & {
  aspect_ratio?: string | null
  platform_preset?: string | null
  template_name?: string | null
  preview_data_url?: string | null
}

export type HomepageFeaturedShowcaseItem = {
  href: string
  id: string
  imageUrl: string | null
  summary: string
  tags: string[]
  title: string
}

export type HomepagePricingPlan = {
  code: BillingPlanCode
  conceptsLabel: string
  exportsLabel: string
  name: string
  previewsLabel: string
  priceLabel: string
  publishingLabel: string
  rendersLabel: string
}

function formatPriceLabel(monthlyPriceUsd: number) {
  return monthlyPriceUsd === 0 ? "Free" : `$${monthlyPriceUsd}/mo`
}

function buildPublishingLabel(plan: BillingPlanRecord) {
  if (
    plan.allow_public_showcase &&
    plan.allow_share_campaigns &&
    plan.allow_delivery_workspaces
  ) {
    return "Showcase, campaign, and delivery publishing"
  }

  if (plan.allow_delivery_workspaces) {
    return "Delivery publishing included"
  }

  if (plan.allow_public_showcase || plan.allow_share_campaigns) {
    return "Limited public publishing"
  }

  return "Internal workflow only"
}

function compactTagList(values: Array<string | null | undefined>) {
  return values.filter((value): value is string =>
    Boolean(value && value.trim().length > 0)
  )
}

export function mapHomepageFeaturedShowcaseItems(
  items: ShowcaseItemRecord[],
  limit = 3
): HomepageFeaturedShowcaseItem[] {
  return items.slice(0, limit).map((item) => {
    const showcaseItem = item as ShowcaseGalleryItem

    return {
      href: "/showcase",
      id: item.id,
      imageUrl: showcaseItem.preview_data_url ?? null,
      summary: item.summary,
      tags: compactTagList([
        showcaseItem.aspect_ratio,
        showcaseItem.platform_preset,
        showcaseItem.template_name
      ]),
      title: item.title
    }
  })
}

export function mapHomepagePricingPlans(
  plans: BillingPlanRecord[]
): HomepagePricingPlan[] {
  return [...plans]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((plan) => ({
      code: plan.code,
      conceptsLabel: `${plan.included_concept_runs} concepts / month`,
      exportsLabel: `${plan.included_final_exports} exports / month`,
      name: plan.display_name,
      previewsLabel: `${plan.included_preview_generations} previews / month`,
      priceLabel: formatPriceLabel(plan.monthly_price_usd),
      publishingLabel: buildPublishingLabel(plan),
      rendersLabel: `${plan.included_render_batches} render batches / month`
    }))
}
