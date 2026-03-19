import type {
  DeliveryWorkspaceRecord,
  ExportRecord
} from "@/server/database/types"
import {
  archiveDeliveryWorkspaceAction,
  upsertDeliveryWorkspaceAction
} from "@/features/delivery/actions/manage-delivery-workspace"
import { getPublicEnvironment } from "@/lib/env"
import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"

type DeliveryWorkspacePanelProps = {
  canonicalExportId: string
  eligibleBatchExports: ExportRecord[]
  eligibilityReason: string | null
  isEligible: boolean
  workspace: DeliveryWorkspaceRecord | null
  workspaceExportIds: string[]
}

export function DeliveryWorkspacePanel({
  canonicalExportId,
  eligibleBatchExports,
  eligibilityReason,
  isEligible,
  workspace,
  workspaceExportIds
}: DeliveryWorkspacePanelProps) {
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
        Delivery workspace
      </p>

      <div className="mt-4 space-y-4">
        {!isEligible ? (
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {eligibilityReason ?? "Only finalized canonical exports can be delivered publicly."}
          </div>
        ) : null}

        {isEligible ? (
          <form action={upsertAction} className="space-y-4">
            <input
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
              defaultValue={workspace?.title ?? ""}
              name="title"
              placeholder="Delivery title"
            />

            <textarea
              className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              defaultValue={workspace?.summary ?? ""}
              name="summary"
              placeholder="Delivery summary"
            />

            <textarea
              className="min-h-32 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              defaultValue={workspace?.handoff_notes ?? ""}
              name="handoff_notes"
              placeholder="Owner-prepared handoff notes"
            />

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-medium text-white">Included downloadable exports</p>
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
                        {exportRecord.variant_key} · {exportRecord.aspect_ratio}
                        {isCanonical ? " · canonical" : ""}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button>{workspace?.status === "active" ? "Update delivery workspace" : "Create delivery workspace"}</Button>

              {workspace?.status === "active" && publicUrl ? (
                <a
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                  href={publicUrl}
                >
                  Open public delivery
                </a>
              ) : null}
            </div>
          </form>
        ) : null}

        {workspace?.status === "active" ? (
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              Delivery workspace is active.
            </div>

            {publicUrl ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">Public URL</p>
                <p className="mt-2 break-all text-sm text-white">{publicUrl}</p>
              </div>
            ) : null}

            <form action={archiveAction}>
              <Button variant="secondary">Archive delivery workspace</Button>
            </form>
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  )
}
