import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import {
  cancelSubscriptionAction,
  changeSubscriptionPlanAction,
  openBillingPortalAction,
  reactivateSubscriptionAction
} from "@/features/settings/actions/manage-billing"
import { formatStorage } from "@/server/billing/billing-service"
import type {
  BillingEventRecord,
  BillingPlanRecord,
  EffectiveOwnerLimits
} from "@/server/database/types"

type BillingPlanPanelProps = {
  billingEvents: BillingEventRecord[]
  billingPlans: BillingPlanRecord[]
  limits: EffectiveOwnerLimits
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

export function BillingPlanPanel({
  billingEvents,
  billingPlans,
  limits
}: BillingPlanPanelProps) {
  const currentPlan = limits.plan
  const stripeManaged = Boolean(limits.subscription.stripe_subscription_id)

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

      <div className="mt-6 flex flex-wrap gap-3">
        {limits.billingAccount?.stripe_customer_id ? (
          <form action={openBillingPortalAction}>
            <FormSubmitButton variant="secondary" pendingLabel="Opening portal…">
              Manage payment method
            </FormSubmitButton>
          </form>
        ) : null}

        {stripeManaged && !limits.subscription.cancel_at_period_end ? (
          <form action={cancelSubscriptionAction}>
            <FormSubmitButton variant="secondary" pendingLabel="Scheduling cancel…">
              Cancel at period end
            </FormSubmitButton>
          </form>
        ) : null}

        {stripeManaged && limits.subscription.cancel_at_period_end ? (
          <form action={reactivateSubscriptionAction}>
            <FormSubmitButton variant="secondary" pendingLabel="Reactivating…">
              Reactivate subscription
            </FormSubmitButton>
          </form>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-4">
        {billingPlans.map((plan) => {
          const isCurrent = plan.code === currentPlan.code
          const canUpgrade = plan.code !== "free" && !isCurrent
          const changeAction = changeSubscriptionPlanAction.bind(null, plan.code)

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

              {canUpgrade ? (
                <form action={changeAction} className="mt-5">
                  <FormSubmitButton pendingLabel="Opening checkout…">
                    {stripeManaged ? `Switch to ${plan.display_name}` : `Choose ${plan.display_name}`}
                  </FormSubmitButton>
                </form>
              ) : null}

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
