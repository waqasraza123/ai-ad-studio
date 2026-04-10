"use server"

import { revalidatePath } from "next/cache"
import { redirectToLoginWithFormError, redirectWithFormError } from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { createActivationPackageForExport, ActivationPackageError } from "@/server/activation/activation-service"
import { getBillingGateDecision } from "@/server/billing/billing-service"

function exportPath(exportId: string) {
  return `/dashboard/exports/${exportId}`
}

export async function createActivationPackageAction(
  exportId: string,
  formData: FormData
) {
  const path = exportPath(exportId)
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  const channel = String(formData.get("channel") ?? "")

  if (
    channel !== "meta" &&
    channel !== "google" &&
    channel !== "tiktok" &&
    channel !== "internal_handoff"
  ) {
    redirectWithFormError(path, "activation_package_failed")
  }

  const gate = await getBillingGateDecision(user.id, "prepare_activation_package")

  if (!gate.allowed) {
    redirectWithFormError(path, gate.code ?? "activation_package_failed")
  }

  try {
    await createActivationPackageForExport({
      channel,
      createdByUserId: user.id,
      createdVia: "owner_dashboard",
      exportId,
      ownerId: user.id
    })
  } catch (error) {
    if (error instanceof ActivationPackageError) {
      redirectWithFormError(path, error.code)
    }

    redirectWithFormError(path, "activation_package_failed")
  }

  revalidatePath(path)
  revalidatePath("/dashboard/analytics")
}
