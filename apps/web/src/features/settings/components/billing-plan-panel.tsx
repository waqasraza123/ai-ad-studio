import { Button } from "@/components/primitives/button"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import {
  cancelSubscriptionAction,
  changeSubscriptionPlanAction,
  openBillingPortalAction,
  reactivateSubscriptionAction
} from "@/features/settings/actions/manage-billing"
import { getBillingPlanNameKey } from "@/lib/billing-plan-labels"
import { getServerI18n } from "@/lib/i18n/server"
import { cn } from "@/lib/utils"
import { formatStorage } from "@/server/billing/billing-service"
import type { BillingPurchaseAvailability } from "@/server/billing/purchase-availability"
import type {
  BillingEventRecord,
  BillingPlanRecord,
  EffectiveOwnerLimits
} from "@/server/database/types"
import type { AppMessageKey } from "@/lib/i18n/messages/en"

type BillingPlanPanelProps = {
  billingEvents: BillingEventRecord[]
  billingPlans: BillingPlanRecord[]
  limits: EffectiveOwnerLimits
  purchaseAvailability: BillingPurchaseAvailability
}

function formatUsd(value: number) {
  return `$${value.toFixed(2)}`
}

function usageLabel(input: {
  cap: number
  current: number
}) {
  return `${input.current} / ${input.cap}`
}

function getSubscriptionStatusLabelKey(
  status: EffectiveOwnerLimits["subscription"]["status"]
): AppMessageKey {
  if (status === "active") {
    return "common.status.active"
  }

  if (status === "free") {
    return "common.status.free"
  }

  if (status === "grace_period") {
    return "settings.billing.status.gracePeriod"
  }

  return "common.status.cancelled"
}

function formatPriceLabel(
  monthlyPriceUsd: number,
  t: (key: AppMessageKey, values?: Record<string, string | number | null | undefined>) => string
) {
  if (monthlyPriceUsd === 0) {
    return t("settings.billing.price.free")
  }

  return t("settings.billing.price.monthly", {
    value: formatUsd(monthlyPriceUsd)
  })
}

function PlanDetails({
  plan,
  t
}: {
  plan: BillingPlanRecord
  t: (key: AppMessageKey, values?: Record<string, string | number | null | undefined>) => string
}) {
  return (
    <div className="mt-4 space-y-2 text-sm text-slate-300">
      <p>{t("settings.billing.planDetails.activeProjects", { count: plan.included_active_projects })}</p>
      <p>{t("settings.billing.planDetails.conceptRuns", { count: plan.included_concept_runs })}</p>
      <p>{t("settings.billing.planDetails.previews", { count: plan.included_preview_generations })}</p>
      <p>{t("settings.billing.planDetails.renderBatches", { count: plan.included_render_batches })}</p>
      <p>{t("settings.billing.planDetails.finalExports", { count: plan.included_final_exports })}</p>
      <p>{t("settings.billing.planDetails.storage", { value: formatStorage(plan.included_storage_bytes) })}</p>
      <p>
        {t("settings.billing.planDetails.concurrency", {
          preview: plan.max_concurrent_preview_jobs,
          render: plan.max_concurrent_render_jobs
        })}
      </p>
      <p>
        {plan.watermark_exports
          ? t("settings.billing.planDetails.watermarked")
          : t("settings.billing.planDetails.noWatermark")}
      </p>
      <p>
        {plan.allow_external_batch_reviews
          ? t("settings.billing.planDetails.externalReviewIncluded")
          : t("settings.billing.planDetails.externalReviewLocked")}
      </p>
    </div>
  )
}

export async function BillingPlanPanel({
  billingEvents,
  billingPlans,
  limits,
  purchaseAvailability
}: BillingPlanPanelProps) {
  const { formatDateTime, t } = await getServerI18n()
  const currentPlan = limits.plan
  const stripeManaged = Boolean(limits.subscription.stripe_subscription_id)
  const purchaseAvailable = stripeManaged
    ? purchaseAvailability.planChangeAvailable
    : purchaseAvailability.checkoutAvailable
  const purchaseUnavailableMessage = stripeManaged
    ? t("settings.billing.unavailable.planChange")
    : t("settings.billing.unavailable.checkout")
  const portalUnavailableMessage = t("settings.billing.unavailable.portal")

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("settings.billing.panel.eyebrow")}
      </p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
            {t("settings.billing.panel.title", {
              value: t(getBillingPlanNameKey(currentPlan.code))
            })}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            {t("settings.billing.panel.description")}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          <p className="text-slate-400">{t("settings.billing.panel.currentPeriod")}</p>
          <p className="mt-2 font-medium text-white">
            {t("settings.billing.panel.periodRange", {
              end: formatDateTime(limits.subscription.current_period_end, {
                dateStyle: "medium",
                timeStyle: "short"
              }),
              start: formatDateTime(limits.subscription.current_period_start, {
                dateStyle: "medium",
                timeStyle: "short"
              })
            })}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("settings.billing.panel.monthlyPlan")}</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatPriceLabel(currentPlan.monthly_price_usd, t)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {t("settings.billing.panel.status", {
              suffix: limits.subscription.cancel_at_period_end
                ? ` • ${t("settings.billing.panel.endsAtClose")}`
                : "",
              value: t(getSubscriptionStatusLabelKey(limits.subscription.status))
            })}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("settings.billing.panel.projects")}</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {usageLabel({
              cap: limits.hardCaps.activeProjects,
              current: limits.usage.active_projects_used
            })}
          </p>
          <p className="mt-2 text-xs text-slate-500">{t("settings.billing.panel.hardCap")}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("settings.billing.panel.generationUsage")}</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {t("settings.billing.panel.generationUsageSummary", {
              concepts: limits.usage.concept_runs_used,
              previews: limits.usage.preview_generations_used
            })}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {t("settings.billing.panel.renderExportSummary", {
              exports: limits.usage.final_exports_used,
              renders: limits.usage.render_batches_used
            })}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("settings.billing.panel.overageStorage")}</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatUsd(limits.usage.projected_overage_usd)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {t("settings.billing.panel.storageUsage", {
              current: formatStorage(limits.usage.storage_bytes_used),
              total: formatStorage(limits.hardCaps.storageBytes)
            })}
          </p>
        </div>
      </div>

      {limits.generationBlocked ? (
        <div className="mt-6 rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {t("settings.billing.panel.generationBlocked", {
            value: limits.generationBlockReason
          })}
        </div>
      ) : null}

      {!purchaseAvailable ? (
        <div className="mt-6 rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {purchaseUnavailableMessage}
        </div>
      ) : null}

      {!purchaseAvailability.portalAvailable &&
      (limits.billingAccount?.stripe_customer_id || stripeManaged) ? (
        <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          {portalUnavailableMessage}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {limits.billingAccount?.stripe_customer_id ? (
          purchaseAvailability.portalAvailable ? (
            <form action={openBillingPortalAction}>
              <FormSubmitButton variant="secondary" pendingLabel={t("settings.billing.portal.pending")}>
                {t("settings.billing.portal.action")}
              </FormSubmitButton>
            </form>
          ) : (
            <Button disabled variant="secondary">
              {t("settings.billing.portal.action")}
            </Button>
          )
        ) : null}

        {stripeManaged && !limits.subscription.cancel_at_period_end ? (
          purchaseAvailability.portalAvailable ? (
            <form action={cancelSubscriptionAction}>
              <FormSubmitButton
                variant="secondary"
                pendingLabel={t("settings.billing.cancel.pending")}
              >
                {t("settings.billing.cancel.action")}
              </FormSubmitButton>
            </form>
          ) : (
            <Button disabled variant="secondary">
              {t("settings.billing.cancel.action")}
            </Button>
          )
        ) : null}

        {stripeManaged && limits.subscription.cancel_at_period_end ? (
          purchaseAvailability.portalAvailable ? (
            <form action={reactivateSubscriptionAction}>
              <FormSubmitButton
                variant="secondary"
                pendingLabel={t("settings.billing.reactivate.pending")}
              >
                {t("settings.billing.reactivate.action")}
              </FormSubmitButton>
            </form>
          ) : (
            <Button disabled variant="secondary">
              {t("settings.billing.reactivate.action")}
            </Button>
          )
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
        {billingPlans.map((plan) => {
          const isCurrent = plan.code === currentPlan.code
          const canUpgrade = plan.code !== "free" && !isCurrent
          const downgradeOnly = plan.code === "free" && currentPlan.code !== "free"
          const changeAction = changeSubscriptionPlanAction.bind(null, plan.code)
          const actionPillLabel = stripeManaged
            ? t("settings.billing.purchase.switchPill")
            : t("settings.billing.purchase.checkoutPill")
          const actionLabel = stripeManaged
            ? t("settings.billing.purchase.switchAction", {
                value: t(getBillingPlanNameKey(plan.code))
              })
            : t("settings.billing.purchase.checkoutAction", {
                value: t(getBillingPlanNameKey(plan.code))
              })

          if (canUpgrade) {
            return (
              <form
                key={plan.code}
                action={changeAction}
                className="h-full"
              >
                <FormSubmitButton
                  pendingLabel={
                    stripeManaged
                      ? t("settings.billing.purchase.switchPending")
                      : t("settings.billing.purchase.checkoutPending")
                  }
                  disabled={!purchaseAvailable}
                  className={cn(
                    "h-full w-full flex-col items-stretch rounded-[1.75rem] border p-5 text-start transition",
                    purchaseAvailable
                      ? "cursor-pointer border-white/10 bg-white/[0.04] hover:border-amber-300/35 hover:bg-white/[0.06] focus-visible:border-amber-300/35"
                      : "cursor-not-allowed border-white/10 bg-white/[0.02]"
                  )}
                  title={!purchaseAvailable ? purchaseUnavailableMessage : undefined}
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
                        {t(getBillingPlanNameKey(plan.code))}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {formatPriceLabel(plan.monthly_price_usd, t)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs",
                        purchaseAvailable
                          ? "border-white/10 bg-white/[0.05] text-slate-200"
                          : "border-amber-400/20 bg-amber-500/10 text-amber-100"
                      )}
                    >
                      {purchaseAvailable
                        ? actionPillLabel
                        : t("settings.billing.purchase.unavailablePill")}
                    </span>
                  </div>

                  <PlanDetails plan={plan} t={t} />

                  <div className="mt-5 flex w-full items-center justify-between gap-3">
                    <span
                      className={cn(
                        "text-xs",
                        purchaseAvailable ? "text-slate-400" : "text-amber-100"
                      )}
                    >
                      {purchaseAvailable
                        ? t("settings.billing.purchase.fullCardHint")
                        : purchaseUnavailableMessage}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium",
                        purchaseAvailable
                          ? "border-amber-400/20 bg-amber-500/10 text-amber-100"
                          : "border-white/10 bg-white/[0.04] text-slate-300"
                      )}
                    >
                      {purchaseAvailable
                        ? actionLabel
                        : t("settings.billing.purchase.unavailableAction")}
                    </span>
                  </div>
                </FormSubmitButton>
              </form>
            )
          }

          return (
            <div
              key={plan.code}
              className={`rounded-[1.75rem] border p-5 ${
                isCurrent
                  ? "border-amber-300/35 bg-amber-500/[0.08]"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
                    {t(getBillingPlanNameKey(plan.code))}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatPriceLabel(plan.monthly_price_usd, t)}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    isCurrent
                      ? "border-amber-300/20 bg-amber-400/10 text-amber-100"
                      : downgradeOnly
                        ? "border-white/10 bg-white/[0.05] text-slate-200"
                        : "border-white/10 bg-white/[0.05] text-slate-200"
                  )}
                >
                  {isCurrent
                    ? t("settings.billing.purchase.currentPill")
                    : downgradeOnly
                      ? t("settings.billing.purchase.downgradeOnlyPill")
                      : actionPillLabel}
                </span>
              </div>

              <PlanDetails plan={plan} t={t} />

              {isCurrent ? (
                <p className="mt-5 text-xs text-amber-100">
                  {t("settings.billing.purchase.currentHint")}
                </p>
              ) : null}

              {downgradeOnly ? (
                <p className="mt-5 text-xs text-slate-400">
                  {t("settings.billing.purchase.downgradeOnlyHint")}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("settings.billing.panel.includedMeterUsage")}</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <p>
              {t("settings.billing.panel.conceptRuns")}{" "}
              {usageLabel({
                cap: limits.plan.included_concept_runs,
                current: limits.usage.concept_runs_used
              })}
            </p>
            <p>
              {t("settings.billing.panel.previews")}{" "}
              {usageLabel({
                cap: limits.plan.included_preview_generations,
                current: limits.usage.preview_generations_used
              })}
            </p>
            <p>
              {t("settings.billing.panel.renderBatches")}{" "}
              {usageLabel({
                cap: limits.plan.included_render_batches,
                current: limits.usage.render_batches_used
              })}
            </p>
            <p>
              {t("settings.billing.panel.finalExports")}{" "}
              {usageLabel({
                cap: limits.plan.included_final_exports,
                current: limits.usage.final_exports_used
              })}
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("settings.billing.panel.billingControls")}</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <p>{t("settings.billing.panel.projectedOverage", { value: formatUsd(limits.usage.projected_overage_usd) })}</p>
            <p>{t("settings.billing.panel.overageCap", { value: formatUsd(limits.budgets.monthlyOverageCapUsd) })}</p>
            <p>{t("settings.billing.panel.providerSafetyCap", { value: formatUsd(limits.budgets.monthlyTotalBudgetUsd) })}</p>
            <p>{t("settings.billing.panel.providerCostTracked", { value: formatUsd(limits.usage.provider_cost_usd) })}</p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("settings.billing.panel.featureAccess")}</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <p>{limits.featureAccess.allowShareCampaigns ? t("settings.billing.panel.campaignPublishing") : t("settings.billing.panel.noCampaignPublishing")}</p>
            <p>{limits.featureAccess.allowPublicShowcase ? t("settings.billing.panel.publicShowcase") : t("settings.billing.panel.noPublicShowcase")}</p>
            <p>{limits.featureAccess.allowDeliveryWorkspaces ? t("settings.billing.panel.deliveryWorkspaces") : t("settings.billing.panel.noDeliveryWorkspaces")}</p>
            <p>{limits.featureAccess.allowExternalBatchReviews ? t("settings.billing.panel.externalReviewLinks") : t("settings.billing.panel.noExternalReviewLinks")}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
          {t("settings.billing.panel.activity")}
        </p>
        {billingEvents.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            {t("settings.billing.panel.activityEmpty")}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {billingEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {event.summary ?? event.event_type}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {event.event_type} • {event.event_status}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(event.event_occurred_at, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SurfaceCard>
  )
}
