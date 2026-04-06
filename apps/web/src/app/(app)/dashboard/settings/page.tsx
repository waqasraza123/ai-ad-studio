import { getFormErrorMessage } from "@/lib/form-error-messages"
import { BrandKitSettingsForm } from "@/features/brand-kits/components/brand-kit-settings-form"
import { OwnerGuardrailsForm } from "@/features/settings/components/owner-guardrails-form"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listBrandKitsByOwner } from "@/server/brand-kits/brand-kit-repository"
import { getOwnerGuardrails } from "@/server/settings/owner-guardrails-repository"

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const resolvedSearchParams = await searchParams
  const formErrorMessage = getFormErrorMessage(resolvedSearchParams.error)

  const [guardrails, brandKits] = await Promise.all([
    getOwnerGuardrails(user.id),
    listBrandKitsByOwner(user.id)
  ])

  const defaultBrandKit = brandKits.find((kit) => kit.is_default) ?? brandKits[0] ?? null

  return (
    <div className="space-y-6">
      {formErrorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {formErrorMessage}
        </div>
      ) : null}
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          Settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
          Cost guardrails and brand system
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Configure budget thresholds, concurrency rules, and the default brand tokens that templates can inherit.
        </p>
      </section>

      <OwnerGuardrailsForm guardrails={guardrails} />
      {defaultBrandKit ? <BrandKitSettingsForm brandKit={defaultBrandKit} /> : null}
    </div>
  )
}
