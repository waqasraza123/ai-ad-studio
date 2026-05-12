"use server"

import { revalidatePath } from "next/cache"
import {
  redirectToLoginWithFormError,
  redirectWithFormError
} from "@/lib/server-action-redirect"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import {
  ActivationPackageError,
  parseActivationTrackingInput,
  updateActivationPackageTracking
} from "@/server/activation/activation-service"

function projectPath(projectId: string) {
  return `/dashboard/projects/${projectId}`
}

export async function updateActivationTrackingAction(
  projectId: string,
  packageId: string,
  formData: FormData
) {
  const path = projectPath(projectId)
  const user = await getAuthenticatedUser()

  if (!user) {
    redirectToLoginWithFormError("auth_required")
  }

  try {
    const input = parseActivationTrackingInput({
      trackingNotes: formData.get("tracking_notes"),
      trackingStatus: formData.get("tracking_status")
    })

    await updateActivationPackageTracking({
      createdByUserId: user.id,
      ownerId: user.id,
      packageId,
      trackingNotes: input.trackingNotes,
      trackingStatus: input.trackingStatus
    })
  } catch (error) {
    if (error instanceof ActivationPackageError) {
      redirectWithFormError(path, error.code)
    }

    redirectWithFormError(path, "activation_tracking_invalid")
  }

  revalidatePath(path)
  revalidatePath("/dashboard/analytics")
}
