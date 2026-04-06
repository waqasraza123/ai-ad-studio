"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { MODEST_WORDING_FORM_ERROR_CODE, validateRecordTextFields } from "@/lib/modest-wording/index"
import { recordPublicDeliveryWorkspaceEventByToken } from "@/server/delivery-workspaces/delivery-workspace-repository"

function readOptionalValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim()
  return value.length > 0 ? value : null
}

export async function acknowledgePublicDeliveryWorkspaceAction(
  token: string,
  formData: FormData
) {
  const actorLabel = readOptionalValue(formData, "actor_label")
  const note = readOptionalValue(formData, "note")
  const path = `/delivery/${token}`

  if (validateRecordTextFields({ actorLabel, note })) {
    redirect(`${path}?error=${encodeURIComponent(MODEST_WORDING_FORM_ERROR_CODE)}`)
  }

  await recordPublicDeliveryWorkspaceEventByToken({
    actorLabel,
    eventType: "acknowledged",
    metadata: note ? { note } : {},
    token
  })

  revalidatePath(path)
}
