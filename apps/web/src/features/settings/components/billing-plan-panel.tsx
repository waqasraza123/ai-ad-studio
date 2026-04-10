import { Button } from "@/components/primitives/button"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import {
  cancelSubscriptionAction,
  changeSubscriptionPlanAction,
  openBillingPortalAction,
  reactivateSubscriptionAction
} from "@/features/settings/actions/manage-billing"
import { getServerI18n } from "@/lib/i18n/server"
import { cn } from "@/lib/utils"
import { formatStorage } from "@/server/billing/billing-service"
import type { BillingPurchaseAvailability } from "@/server/billing/purchase-availability"
import type {
  BillingEventRecord,
  BillingPlanRecord,
  EffectiveOwnerLimits
} from "@/server/database/types"

type BillingPlanPanelProps = {
  billingEvents: BillingEventRecord[]
  billingPlans: BillingPlanRecord[]
  limits: EffectiveOwnerLimits
  purchaseAvailability: BillingPurchaseAvailability
}

function formatUsd(value: number) {
  return `$${value.toFixed(2)}`
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

function usageLabel(input: {
  cap: number
  current: number
}) {
  return `${input.current} / ${input.cap}`
}

export async function BillingPlanPanel({
  billingEvents,
  billingPlans,
  limits,
  purchaseAvailability
}: BillingPlanPanelProps) {
  const { t } = await getServerI18n()
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
        Billing and plan
      </p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
            {currentPlan.display_name} plan
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Cards and USDC checkout run through Stripe Checkout. Base is recommended for
            lower stablecoin network fees. Free exports are watermarked; paid plans
            remove the watermark and unlock stricter production workflows.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          <p className="text-slate-400">Current billing period</p>
          <p className="mt-2 font-medium text-white">
            {formatTimestamp(limits.subscription.current_period_start)}
          </p>
          <p className="text-slate-400">to {formatTimestamp(limits.subscription.current_period_end)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Monthly plan</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {currentPlan.monthly_price_usd === 0
              ? "Free"
              : `${formatUsd(currentPlan.monthly_price_usd)}/mo`}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Status: {limits.subscription.status}
            {limits.subscription.cancel_at_period_end ? " • ends at period close" : ""}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Projects</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {usageLabel({
              cap: limits.hardCaps.activeProjects,
              current: limits.usage.active_projects_used
            })}
          </p>
          <p className="mt-2 text-xs text-slate-500">Hard cap, no overage.</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Generation usage</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {limits.usage.concept_runs_used} concepts • {limits.usage.preview_generations_used} previews
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Renders: {limits.usage.render_batches_used} batches • Exports:{" "}
            {limits.usage.final_exports_used}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Overage and storage</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatUsd(limits.usage.projected_overage_usd)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Storage {formatStorage(limits.usage.storage_bytes_used)} of{" "}
            {formatStorage(limits.hardCaps.storageBytes)}
          </p>
        </div>
      </div>

      {limits.generationBlocked ? (
        <div className="mt-6 rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Generation is currently blocked by billing: {limits.generationBlockReason}.
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
              <FormSubmitButton variant="secondary" pendingLabel="Scheduling cancel…">
                Cancel at period end
              </FormSubmitButton>
            </form>
          ) : (
            <Button disabled variant="secondary">
              Cancel at period end
            </Button>
          )
        ) : null}

        {stripeManaged && limits.subscription.cancel_at_period_end ? (
          purchaseAvailability.portalAvailable ? (
            <form action={reactivateSubscriptionAction}>
              <FormSubmitButton variant="secondary" pendingLabel="Reactivating…">
                Reactivate subscription
              </FormSubmitButton>
            </form>
          ) : (
            <Button disabled variant="secondary">
              Reactivate subscription
            </Button>
          )
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-4">
        {billingPlans.map((plan) => {
          const isCurrent = plan.code === currentPlan.code
          const canUpgrade = plan.code !== "free" && !isCurrent
          const changeAction = changeSubscriptionPlanAction.bind(null, plan.code)

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
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
                        {plan.display_name}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {plan.monthly_price_usd === 0
                          ? "Free"
                          : `${formatUsd(plan.monthly_price_usd)}/mo`}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-200">
                      {stripeManaged
                        ? t("settings.billing.purchase.switchPill")
                        : t("settings.billing.purchase.checkoutPill")}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    <p>{plan.included_active_projects} active projects</p>
                    <p>{plan.included_concept_runs} concept runs / month</p>
                    <p>{plan.included_preview_generations} previews / month</p>
                    <p>{plan.included_render_batches} render batches / month</p>
                    <p>{plan.included_final_exports} final exports / month</p>
                    <p>{formatStorage(plan.included_storage_bytes)} storage</p>
                    <p>
                      {plan.max_concurrent_preview_jobs} preview jobs •{" "}
                      {plan.max_concurrent_render_jobs} render jobs
                    </p>
                    <p>{plan.watermark_exports ? "Watermarked exports" : "No export watermark"}</p>
                    <p>
                      {plan.allow_external_batch_reviews
                        ? "External review included"
                        : "External review locked"}
                    </p>
                  </div>

                  <div className="mt-5 flex w-full items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                      {purchaseAvailable
                        ? t("settings.billing.purchase.fullCardHint")
                        : purchaseUnavailableMessage}
                    </span>
                    <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-100">
                      {stripeManaged
                        ? t("settings.billing.purchase.switchAction", {
                            value: plan.display_name
                          })
                        : t("settings.billing.purchase.checkoutAction", {
                            value: plan.display_name
                          })}
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
                    {plan.display_name}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {plan.monthly_price_usd === 0
                      ? "Free"
                      : `${formatUsd(plan.monthly_price_usd)}/mo`}
                  </p>
                </div>
                {isCurrent ? (
                  <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">
                    Current
                  </span>
                ) : null}
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>{plan.included_active_projects} active projects</p>
                <p>{plan.included_concept_runs} concept runs / month</p>
                <p>{plan.included_preview_generations} previews / month</p>
                <p>{plan.included_render_batches} render batches / month</p>
                <p>{plan.included_final_exports} final exports / month</p>
                <p>{formatStorage(plan.included_storage_bytes)} storage</p>
                <p>
                  {plan.max_concurrent_preview_jobs} preview jobs •{" "}
                  {plan.max_concurrent_render_jobs} render jobs
                </p>
                <p>{plan.watermark_exports ? "Watermarked exports" : "No export watermark"}</p>
                <p>
                  {plan.allow_external_batch_reviews
                    ? "External review included"
                    : "External review locked"}
                </p>
              </div>

              {!canUpgrade && plan.code === "free" && currentPlan.code !== "free" ? (
                <p className="mt-5 text-xs text-slate-500">
                  Return to Free by canceling the paid subscription at period end.
                </p>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Included meter usage</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <p>
              Concept runs:{" "}
              {usageLabel({
                cap: limits.plan.included_concept_runs,
                current: limits.usage.concept_runs_used
              })}
            </p>
            <p>
              Previews:{" "}
              {usageLabel({
                cap: limits.plan.included_preview_generations,
                current: limits.usage.preview_generations_used
              })}
            </p>
            <p>
              Render batches:{" "}
              {usageLabel({
                cap: limits.plan.included_render_batches,
                current: limits.usage.render_batches_used
              })}
            </p>
            <p>
              Final exports:{" "}
              {usageLabel({
                cap: limits.plan.included_final_exports,
                current: limits.usage.final_exports_used
              })}
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Billing controls</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <p>Projected overage: {formatUsd(limits.usage.projected_overage_usd)}</p>
            <p>Overage cap: {formatUsd(limits.budgets.monthlyOverageCapUsd)}</p>
            <p>Provider safety cap: {formatUsd(limits.budgets.monthlyTotalBudgetUsd)}</p>
            <p>Provider cost tracked: {formatUsd(limits.usage.provider_cost_usd)}</p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Feature access</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <p>{limits.featureAccess.allowShareCampaigns ? "Campaign publishing" : "No campaign publishing"}</p>
            <p>{limits.featureAccess.allowPublicShowcase ? "Public showcase" : "No public showcase"}</p>
            <p>{limits.featureAccess.allowDeliveryWorkspaces ? "Delivery workspaces" : "No delivery workspaces"}</p>
            <p>{limits.featureAccess.allowExternalBatchReviews ? "External review links" : "No external review links"}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
          Billing activity
        </p>
        {billingEvents.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No billing events yet. Stripe webhook activity, invoices, and checkout events
            will appear here.
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
                    {formatTimestamp(event.event_occurred_at)}
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
