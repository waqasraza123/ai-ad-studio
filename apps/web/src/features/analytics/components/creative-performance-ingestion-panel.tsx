import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { submitCreativePerformanceAction } from "@/features/analytics/actions/submit-creative-performance"
import { getServerI18n } from "@/lib/i18n/server"

type CreativePerformanceExportOption = {
  id: string
  label: string
}

type CreativePerformanceIngestionPanelProps = {
  ingestionEnabled: boolean
  exportOptions: CreativePerformanceExportOption[]
}

export async function CreativePerformanceIngestionPanel({
  ingestionEnabled,
  exportOptions
}: CreativePerformanceIngestionPanelProps) {
  const { t } = await getServerI18n()

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("analytics.creative.ingestion.eyebrow")}
      </p>

      <div className="mt-4 space-y-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
          {t("analytics.creative.ingestion.description")}
        </div>

        {!ingestionEnabled ? (
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {t("analytics.creative.ingestion.upgradeRequired")}
          </div>
        ) : exportOptions.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            {t("analytics.creative.ingestion.empty")}
          </div>
        ) : (
          <form action={submitCreativePerformanceAction} className="space-y-4">
            <select
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
              defaultValue={exportOptions[0]?.id ?? ""}
              name="export_id"
            >
              {exportOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
              defaultValue="meta"
              name="channel"
            >
              <option value="meta">{t("activation.channel.meta")}</option>
              <option value="google">{t("activation.channel.google")}</option>
              <option value="tiktok">{t("activation.channel.tiktok")}</option>
              <option value="internal_handoff">
                {t("activation.channel.internalHandoff")}
              </option>
            </select>

            <input
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
              name="metric_date"
              type="date"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                min="0"
                name="impressions"
                placeholder={t("analytics.creative.ingestion.impressions")}
                step="1"
                type="number"
              />
              <input
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                min="0"
                name="clicks"
                placeholder={t("analytics.creative.ingestion.clicks")}
                step="1"
                type="number"
              />
              <input
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                min="0"
                name="spend_usd"
                placeholder={t("analytics.creative.ingestion.spend")}
                step="0.01"
                type="number"
              />
              <input
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                min="0"
                name="conversions"
                placeholder={t("analytics.creative.ingestion.conversions")}
                step="1"
                type="number"
              />
            </div>

            <input
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
              min="0"
              name="conversion_value_usd"
              placeholder={t("analytics.creative.ingestion.conversionValue")}
              step="0.01"
              type="number"
            />

            <input
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
              name="external_account_label"
              placeholder={t("analytics.creative.ingestion.accountLabel")}
            />

            <textarea
              className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              name="notes"
              placeholder={t("analytics.creative.ingestion.notes")}
            />

            <FormSubmitButton
              className="w-full justify-center"
              pendingLabel={t("analytics.creative.ingestion.pending")}
            >
              {t("analytics.creative.ingestion.submit")}
            </FormSubmitButton>
          </form>
        )}
      </div>
    </SurfaceCard>
  )
}
