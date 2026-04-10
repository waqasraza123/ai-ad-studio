import { SurfaceCard } from "@/components/primitives/surface-card"
import { CreativePerformanceIngestionForm } from "@/features/analytics/components/creative-performance-ingestion-form"
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
          <CreativePerformanceIngestionForm
            exportOptions={exportOptions}
            labels={{
              accountLabel: t("analytics.creative.ingestion.accountLabel"),
              addRow: t("analytics.creative.ingestion.addRow"),
              clicks: t("analytics.creative.ingestion.clicks"),
              channelLabels: {
                google: t("activation.channel.google"),
                internal_handoff: t("activation.channel.internalHandoff"),
                meta: t("activation.channel.meta"),
                tiktok: t("activation.channel.tiktok")
              },
              conversionValue: t("analytics.creative.ingestion.conversionValue"),
              conversions: t("analytics.creative.ingestion.conversions"),
              impressions: t("analytics.creative.ingestion.impressions"),
              metricDate: t("analytics.creative.ingestion.metricDate"),
              notes: t("analytics.creative.ingestion.notes"),
              pending: t("analytics.creative.ingestion.pending"),
              removeRow: t("analytics.creative.ingestion.removeRow"),
              rowLabelPrefix: t("analytics.creative.ingestion.rowLabelPrefix"),
              rowsDescription: t("analytics.creative.ingestion.rowsDescription"),
              rowsTitle: t("analytics.creative.ingestion.rowsTitle"),
              sharedContext: t("analytics.creative.ingestion.sharedContext"),
              spend: t("analytics.creative.ingestion.spend"),
              submit: t("analytics.creative.ingestion.submit")
            }}
          />
        )}
      </div>
    </SurfaceCard>
  )
}
