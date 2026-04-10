import { SurfaceCard } from "@/components/primitives/surface-card"
import { BrandKitSettingsForm } from "@/features/brand-kits/components/brand-kit-settings-form"
import { getFormErrorMessage } from "@/lib/form-error-messages"
import { getServerI18n } from "@/lib/i18n/server"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getDefaultBrandKitForOwner } from "@/server/brand-kits/brand-kit-repository"

type BrandSettingsPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function BrandSettingsPage({
  searchParams
}: BrandSettingsPageProps) {
  const { t } = await getServerI18n()
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const resolvedSearchParams = await searchParams
  const formErrorMessage = getFormErrorMessage(resolvedSearchParams.error, t)
  const brandKit = await getDefaultBrandKitForOwner(user.id)

  return (
    <div className="space-y-6">
      {formErrorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {formErrorMessage}
        </div>
      ) : null}

      {brandKit ? (
        <BrandKitSettingsForm brandKit={brandKit} />
      ) : (
        <SurfaceCard className="p-6">
          <p className="text-sm text-slate-300">{t("settings.brand.unavailable")}</p>
        </SurfaceCard>
      )}
    </div>
  )
}
