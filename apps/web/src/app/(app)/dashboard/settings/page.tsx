import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getEffectiveOwnerLimits } from "@/server/billing/billing-service"
import { getBillingPurchaseAvailability } from "@/server/billing/purchase-availability"
import { getDefaultBrandKitForOwner } from "@/server/brand-kits/brand-kit-repository"
import { SettingsOverviewGrid } from "@/features/settings/components/settings-overview-grid"
import { getOwnerGuardrails } from "@/server/settings/owner-guardrails-repository"

export default async function SettingsPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const [guardrails, brandKit, billingLimits, purchaseAvailability] = await Promise.all([
    getOwnerGuardrails(user.id),
    getDefaultBrandKitForOwner(user.id),
    getEffectiveOwnerLimits(user.id),
    getBillingPurchaseAvailability()
  ])

  return (
    <SettingsOverviewGrid
      brandKit={brandKit}
      guardrails={guardrails}
      limits={billingLimits}
      purchaseAvailability={purchaseAvailability}
    />
  )
}
