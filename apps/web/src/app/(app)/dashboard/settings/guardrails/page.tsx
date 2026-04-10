import { OwnerGuardrailsForm } from "@/features/settings/components/owner-guardrails-form"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getOwnerGuardrails } from "@/server/settings/owner-guardrails-repository"

export default async function GuardrailsSettingsPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const guardrails = await getOwnerGuardrails(user.id)

  return <OwnerGuardrailsForm guardrails={guardrails} />
}
