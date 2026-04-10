import { unstable_cache } from "next/cache"
import { getBillingRuntimeDiagnostics } from "@/server/billing/runtime-readiness"

export type BillingPurchaseAvailability = {
  checkoutAvailable: boolean
  planChangeAvailable: boolean
  portalAvailable: boolean
  reasonCode: string | null
  reasonMessage: string | null
}

function toBillingPurchaseAvailability(input: Awaited<ReturnType<typeof getBillingRuntimeDiagnostics>>): BillingPurchaseAvailability {
  const checkoutAvailable = input.capabilities.checkoutSessionsAvailable
  const planChangeAvailable =
    input.capabilities.activeSubscriptionPlanChangesAvailable
  const portalAvailable = input.capabilities.billingPortalAvailable

  let reasonCode: string | null = null

  if (!checkoutAvailable) {
    reasonCode = "billing_checkout_unavailable"
  } else if (!planChangeAvailable) {
    reasonCode = "billing_plan_change_unavailable"
  } else if (!portalAvailable) {
    reasonCode = "billing_portal_unavailable"
  }

  return {
    checkoutAvailable,
    planChangeAvailable,
    portalAvailable,
    reasonCode,
    reasonMessage: input.issues[0] ?? null
  }
}

const getCachedBillingPurchaseAvailability = unstable_cache(
  async () => {
    const diagnostics = await getBillingRuntimeDiagnostics()
    return toBillingPurchaseAvailability(diagnostics)
  },
  ["billing-purchase-availability"],
  { revalidate: 60 }
)

export async function getBillingPurchaseAvailability() {
  return getCachedBillingPurchaseAvailability()
}

export const billingPurchaseAvailabilityInternals = {
  toBillingPurchaseAvailability
}
