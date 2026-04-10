import { getFormErrorMessage } from "@/lib/form-error-messages"
import { BillingPlanPanel } from "@/features/settings/components/billing-plan-panel"
import { getBillingFeedbackMessageKey } from "@/features/settings/lib/billing-feedback"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  getEffectiveOwnerLimits,
  listBillingEventsByOwner,
  listBillingPlans
} from "@/server/billing/billing-service"
import { getBillingPurchaseAvailability } from "@/server/billing/purchase-availability"
import { getServerI18n } from "@/lib/i18n/server"

type BillingSettingsPageProps = {
  searchParams: Promise<{
    billing?: string
    error?: string
  }>
}

export default async function BillingSettingsPage({
  searchParams
}: BillingSettingsPageProps) {
  const { t } = await getServerI18n()
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const resolvedSearchParams = await searchParams
  const formErrorMessage = getFormErrorMessage(resolvedSearchParams.error, t)
  const billingFeedbackKey = getBillingFeedbackMessageKey(
    resolvedSearchParams.billing
  )

  const [billingPlans, billingEvents, billingLimits, purchaseAvailability] =
    await Promise.all([
      listBillingPlans(),
      listBillingEventsByOwner(user.id, { limit: 12 }),
      getEffectiveOwnerLimits(user.id),
      getBillingPurchaseAvailability()
    ])

  return (
    <div className="space-y-6">
      {formErrorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {formErrorMessage}
        </div>
      ) : null}
      {billingFeedbackKey ? (
        <div className="rounded-[1.5rem] border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {t(billingFeedbackKey)}
        </div>
      ) : null}

      <BillingPlanPanel
        billingEvents={billingEvents}
        billingPlans={billingPlans}
        limits={billingLimits}
        purchaseAvailability={purchaseAvailability}
      />
    </div>
  )
}
