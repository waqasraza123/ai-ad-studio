"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { upsertOwnerGuardrails } from "@/server/settings/owner-guardrails-repository"

function readCurrencyValue(formData: FormData, key: string, fallback: number) {
  const rawValue = String(formData.get(key) ?? "").trim()
  const parsedValue = Number(rawValue)

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return fallback
  }

  return parsedValue
}

function readIntegerValue(formData: FormData, key: string, fallback: number) {
  const rawValue = String(formData.get(key) ?? "").trim()
  const parsedValue = Number.parseInt(rawValue, 10)

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback
  }

  return parsedValue
}

export async function updateOwnerGuardrailsAction(formData: FormData) {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication is required")
  }

  await upsertOwnerGuardrails({
    autoBlockOnBudget: formData.get("auto_block_on_budget") === "on",
    maxConcurrentPreviewJobs: readIntegerValue(
      formData,
      "max_concurrent_preview_jobs",
      3
    ),
    maxConcurrentRenderJobs: readIntegerValue(
      formData,
      "max_concurrent_render_jobs",
      2
    ),
    monthlyOpenaiBudgetUsd: readCurrencyValue(
      formData,
      "monthly_openai_budget_usd",
      75
    ),
    monthlyRunwayBudgetUsd: readCurrencyValue(
      formData,
      "monthly_runway_budget_usd",
      75
    ),
    monthlyTotalBudgetUsd: readCurrencyValue(
      formData,
      "monthly_total_budget_usd",
      200
    ),
    ownerId: user.id
  })

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")
}
