"use server"

import { revalidatePath } from "next/cache"
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

  await recordPublicDeliveryWorkspaceEventByToken({
    actorLabel,
    eventType: "acknowledged",
    metadata: note ? { note } : {},
    token
  })

  revalidatePath(`/delivery/${token}`)
}
