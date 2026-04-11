import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { selectProjectBrandKitAction } from "@/features/brand-kits/actions/select-brand-kit"
import { getServerI18n } from "@/lib/i18n/server"
import type { BrandKitRecord } from "@/server/database/types"

type BrandKitSelectorPanelProps = {
  brandKits: BrandKitRecord[]
  currentBrandKitId: string | null
  projectId: string
}

export async function BrandKitSelectorPanel({
  brandKits,
  currentBrandKitId,
  projectId
}: BrandKitSelectorPanelProps) {
  const { t } = await getServerI18n()
  const action = selectProjectBrandKitAction.bind(null, projectId)
  const currentBrandKit =
    brandKits.find((kit) => kit.id === currentBrandKitId) ?? brandKits[0] ?? null

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("brandKit.selector.eyebrow")}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        {t("brandKit.selector.title")}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        {t("brandKit.selector.description")}
      </p>

      <form action={action} className="mt-6 space-y-5">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">{t("brandKit.selector.label")}</span>
          <select
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
            defaultValue={currentBrandKit?.id ?? ""}
            name="brandKitId"
          >
            {brandKits.map((kit) => (
              <option key={kit.id} value={kit.id}>
                {kit.name}
              </option>
            ))}
          </select>
        </label>

        {currentBrandKit ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">{currentBrandKit.name}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(currentBrandKit.palette).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-white/10 bg-black/10 p-3"
                >
                  <div
                    className="h-10 w-16 rounded-xl border border-white/10"
                    style={{ backgroundColor: value }}
                  />
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    {key}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {t("brandKit.selector.heading")}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {currentBrandKit.typography.heading_family} · {currentBrandKit.typography.headline_weight}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {t("brandKit.selector.body")}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {currentBrandKit.typography.body_family} · {currentBrandKit.typography.body_weight}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <FormSubmitButton pendingLabel={t("brandKit.selector.pending")}>
          {t("brandKit.selector.save")}
        </FormSubmitButton>
      </form>
    </SurfaceCard>
  )
}
