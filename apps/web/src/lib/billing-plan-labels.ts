import type { AppMessageKey } from "@/lib/i18n/messages/en"
import type { BillingPlanCode } from "@/server/database/types"

export function getBillingPlanNameKey(code: BillingPlanCode): AppMessageKey {
  if (code === "starter") {
    return "billing.plan.starter"
  }

  if (code === "growth") {
    return "billing.plan.growth"
  }

  if (code === "scale") {
    return "billing.plan.scale"
  }

  return "billing.plan.free"
}
