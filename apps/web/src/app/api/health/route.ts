import {
  getWebRuntimeReadiness,
  getWebRuntimeStatus
} from "@/lib/env"
import { getBillingPlanCatalogReadiness } from "@/server/billing/runtime-readiness"

export async function GET() {
  const envReadiness = getWebRuntimeReadiness()
  const billingPlanCatalog = await getBillingPlanCatalogReadiness()
  const readiness = {
    ...envReadiness,
    billingPlanCatalogReady: billingPlanCatalog.status === "ok"
  }

  return Response.json({
    name: "AI Ad Studio",
    readiness,
    service: "web",
    status:
      getWebRuntimeStatus(envReadiness) === "ok" && readiness.billingPlanCatalogReady
        ? "ok"
        : "degraded",
    timestamp: new Date().toISOString()
  })
}
