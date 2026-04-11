import type {
  DeliveryWorkspaceRecord,
  ExportRecord
} from "@/server/database/types"
import {
  archiveDeliveryWorkspaceAction,
  upsertDeliveryWorkspaceAction
} from "@/features/delivery/actions/manage-delivery-workspace"
import { getPublicEnvironment } from "@/lib/env"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"
import type { AppMessageKey } from "@/lib/i18n/messages/en"
import { getRenderVariantLabelKey } from "@/features/renders/lib/render-ui"

type DeliveryWorkspacePanelProps = {
  canonicalExportId: string
  eligibleBatchExports: ExportRecord[]
  eligibilityReason: AppMessageKey | null
  isEligible: boolean
  workspace: DeliveryWorkspaceRecord | null
  workspaceExportIds: string[]
}

export async function DeliveryWorkspacePanel({
  canonicalExportId,
  eligibleBatchExports,
  eligibilityReason,
  isEligible,
  workspace,
  workspaceExportIds
}: DeliveryWorkspacePanelProps) {
  const { t } = await getServerI18n()
  const upsertAction = upsertDeliveryWorkspaceAction.bind(null, canonicalExportId)
  const archiveAction = archiveDeliveryWorkspaceAction.bind(null, canonicalExportId)
  const environment = getPublicEnvironment()
  const publicUrl = workspace ? `${environment.NEXT_PUBLIC_APP_URL}/delivery/${workspace.token}` : null
  const selectedExportIds = new Set<string>(
    workspaceExportIds.length > 0 ? workspaceExportIds : [canonicalExportId]
  )

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("delivery.workspace.eyebrow")}
      </p>

      <div className="mt-4 space-y-4">
        {!isEligible ? (
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {eligibilityReason
              ? t(eligibilityReason)
              : t("delivery.workspace.ineligible")}
          </div>
        ) : null}

        {isEligible ? (
          <form action={upsertAction} className="space-y-4">
            <input
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
              defaultValue={workspace?.title ?? ""}
              name="title"
              placeholder={t("delivery.workspace.titlePlaceholder")}
            />

            <textarea
              className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              defaultValue={workspace?.summary ?? ""}
              name="summary"
              placeholder={t("delivery.workspace.summaryPlaceholder")}
            />

            <textarea
              className="min-h-32 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              defaultValue={workspace?.handoff_notes ?? ""}
              name="handoff_notes"
              placeholder={t("delivery.workspace.handoffPlaceholder")}
            />

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-medium text-white">
                {t("delivery.workspace.includedExports")}
              </p>
              <div className="mt-4 space-y-3">
                {eligibleBatchExports.map((exportRecord) => {
                  const isCanonical = exportRecord.id === canonicalExportId
                  return (
                    <label key={exportRecord.id} className="flex items-center gap-3 text-sm text-slate-300">
                      <input
                        defaultChecked={isCanonical || selectedExportIds.has(exportRecord.id)}
                        name="export_ids"
                        type="checkbox"
                        value={exportRecord.id}
                      />
                      <span>
                        {t(getRenderVariantLabelKey(exportRecord.variant_key))} · {exportRecord.aspect_ratio}
                        {isCanonical ? ` · ${t("public.delivery.canonical").toLowerCase()}` : ""}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <FormSubmitButton pendingLabel={t("delivery.workspace.pending")}>
                {workspace?.status === "active"
                  ? t("delivery.workspace.update")
                  : t("delivery.workspace.create")}
              </FormSubmitButton>

              {workspace?.status === "active" && publicUrl ? (
                <a
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                  href={publicUrl}
                >
                  {t("delivery.workspace.openPublic")}
                </a>
              ) : null}
            </div>
          </form>
        ) : null}

        {workspace?.status === "active" ? (
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              {t("delivery.workspace.active")}
            </div>

            {publicUrl ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">{t("delivery.workspace.publicUrl")}</p>
                <p className="mt-2 break-all text-sm text-white">{publicUrl}</p>
              </div>
            ) : null}

            <form action={archiveAction}>
              <FormSubmitButton
                variant="secondary"
                pendingLabel={t("delivery.workspace.archivePending")}
              >
                {t("delivery.workspace.archive")}
              </FormSubmitButton>
            </form>
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  )
}
