import type {
  BillingPlanCode,
  BillingPlanRecord,
  ShowcaseItemRecord
} from "@/server/database/types"
import { getBillingPlanNameKey } from "@/lib/billing-plan-labels"
import type { AppMessageKey } from "@/lib/i18n/messages/en"
import type { TranslationValues } from "@/lib/i18n/translator"

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

type HomepageI18n = {
  formatCurrency: (
    value: number,
    currency?: string,
    options?: Intl.NumberFormatOptions
  ) => string
  t: (key: AppMessageKey, values?: TranslationValues) => string
}

function formatPriceLabel(monthlyPriceUsd: number, i18n: HomepageI18n) {
  if (monthlyPriceUsd === 0) {
    return i18n.t("marketing.pricing.free")
  }

  return `${i18n.formatCurrency(monthlyPriceUsd, "USD", {
    maximumFractionDigits: 0
  })}${i18n.t("marketing.pricing.perMonth")}`
}

function buildPublishingLabel(plan: BillingPlanRecord, i18n: HomepageI18n) {
  if (
    plan.allow_public_showcase &&
    plan.allow_share_campaigns &&
    plan.allow_delivery_workspaces
  ) {
    return i18n.t("marketing.pricing.publishing.full")
  }

  if (plan.allow_delivery_workspaces) {
    return i18n.t("marketing.pricing.publishing.delivery")
  }

  if (plan.allow_public_showcase || plan.allow_share_campaigns) {
    return i18n.t("marketing.pricing.publishing.limited")
  }

  return i18n.t("marketing.pricing.publishing.internal")
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
  plans: BillingPlanRecord[],
  i18n: HomepageI18n
): HomepagePricingPlan[] {
  return [...plans]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((plan) => ({
      code: plan.code,
      conceptsLabel: i18n.t("marketing.pricing.conceptsPerMonth", {
        count: plan.included_concept_runs
      }),
      exportsLabel: i18n.t("marketing.pricing.exportsPerMonth", {
        count: plan.included_final_exports
      }),
      name: i18n.t(getBillingPlanNameKey(plan.code)),
      previewsLabel: i18n.t("marketing.pricing.previewsPerMonth", {
        count: plan.included_preview_generations
      }),
      priceLabel: formatPriceLabel(plan.monthly_price_usd, i18n),
      publishingLabel: buildPublishingLabel(plan, i18n),
      rendersLabel: i18n.t("marketing.pricing.rendersPerMonth", {
        count: plan.included_render_batches
      })
    }))
}
