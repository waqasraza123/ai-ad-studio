"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  redirectToLoginWithFormError,
  redirectWithFormError
} from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getBillingGateDecision } from "@/server/billing/billing-service"
import {
  CreativePerformanceError,
  ingestManualCreativePerformanceBatch,
  parseCreativePerformanceTargetValue,
  parseManualCreativePerformanceBatchInput
} from "@/server/creative-performance/creative-performance-service"

const analyticsPath = "/dashboard/analytics"

export async function submitCreativePerformanceAction(formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const gate = await getBillingGateDecision(
    user.id,
    "ingest_creative_performance"
  )

  if (!gate.allowed) {
    redirectWithFormError(
      analyticsPath,
      gate.code ?? "creative_performance_invalid"
    )
  }

  try {
    const rowTargets = formData.getAll("row_target")
    const parsedTargets = rowTargets.map((target) =>
      parseCreativePerformanceTargetValue(target)
    )
    const input = parseManualCreativePerformanceBatchInput({
      activationPackageIds:
        parsedTargets.length > 0
          ? parsedTargets.map((target) => target.activationPackageId ?? "")
          : formData.getAll("activation_package_id"),
      channels:
        parsedTargets.length > 0
          ? parsedTargets.map(
              (target, index) =>
                target.channel ?? formData.getAll("row_channel")[index]
            )
          : formData.getAll("row_channel"),
      clicks: formData.getAll("row_clicks"),
      conversionValueUsd: formData.getAll("row_conversion_value_usd"),
      conversions: formData.getAll("row_conversions"),
      exportIds:
        parsedTargets.length > 0
          ? parsedTargets.map((target) => target.exportId)
          : formData.getAll("row_export_id"),
      externalAccountLabel: formData.get("external_account_label"),
      impressions: formData.getAll("row_impressions"),
      metricDates: formData.getAll("row_metric_date"),
      notes: formData.get("notes"),
      operatorLabel: null,
      ownerId: user.id,
      source: "manual_owner",
      spendUsd: formData.getAll("row_spend_usd"),
      submittedByUserId: user.id
    })

    const records = await ingestManualCreativePerformanceBatch(input)

    revalidatePath(analyticsPath)
    redirect(
      `${analyticsPath}?creative_performance=recorded&creative_performance_count=${records.length}`
    )
  } catch (error) {
    if (error instanceof CreativePerformanceError) {
      redirectWithFormError(analyticsPath, error.code)
    }

    redirectWithFormError(analyticsPath, "creative_performance_invalid")
  }

  redirectWithFormError(analyticsPath, "creative_performance_invalid")
}
