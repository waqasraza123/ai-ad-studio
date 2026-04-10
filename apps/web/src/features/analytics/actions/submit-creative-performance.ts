"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getBillingGateDecision } from "@/server/billing/billing-service"
import {
  CreativePerformanceError,
  ingestManualCreativePerformance,
  parseManualCreativePerformanceInput
} from "@/server/creative-performance/creative-performance-service"

const analyticsPath = "/dashboard/analytics"

export async function submitCreativePerformanceAction(formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const gate = await getBillingGateDecision(user.id, "ingest_creative_performance")

  if (!gate.allowed) {
    redirectWithFormError(
      analyticsPath,
      gate.code ?? "creative_performance_invalid"
    )
  }

  try {
    const input = parseManualCreativePerformanceInput({
      activationPackageId: formData.get("activation_package_id"),
      channel: formData.get("channel"),
      clicks: formData.get("clicks"),
      conversionValueUsd: formData.get("conversion_value_usd"),
      conversions: formData.get("conversions"),
      exportId: formData.get("export_id"),
      externalAccountLabel: formData.get("external_account_label"),
      impressions: formData.get("impressions"),
      metricDate: formData.get("metric_date"),
      notes: formData.get("notes"),
      operatorLabel: null,
      ownerId: user.id,
      source: "manual_owner",
      spendUsd: formData.get("spend_usd"),
      submittedByUserId: user.id
    })

    await ingestManualCreativePerformance(input)
  } catch (error) {
    if (error instanceof CreativePerformanceError) {
      redirectWithFormError(analyticsPath, error.code)
    }

    redirectWithFormError(analyticsPath, "creative_performance_invalid")
  }

  revalidatePath(analyticsPath)
  redirect(`${analyticsPath}?creative_performance=recorded`)
}
