import { notFound } from "next/navigation"
import {
  getActiveDeliveryWorkspaceByToken,
  listAssetsForDeliveryWorkspace,
  listExportsForDeliveryWorkspace,
  listPublicDeliveryWorkspaceExportsByWorkspaceId
} from "@/server/delivery-workspaces/delivery-workspace-repository"

type PublicDeliveryPageProps = {
  params: Promise<{
    token: string
  }>
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Pending"
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

export default async function PublicDeliveryPage({
  params
}: PublicDeliveryPageProps) {
  const { token } = await params

  const workspace = await getActiveDeliveryWorkspaceByToken(token)

  if (!workspace) {
    notFound()
  }

  const workspaceExports = await listPublicDeliveryWorkspaceExportsByWorkspaceId(workspace.id)
  const exports = await listExportsForDeliveryWorkspace({
    exportIds: workspaceExports.map((item) => item.export_id)
  })
  const assets = await listAssetsForDeliveryWorkspace({
    assetIds: exports
      .map((exportRecord) => exportRecord.asset_id)
      .filter((assetId): assetId is string => Boolean(assetId))
  })

  const exportsById = new Map(exports.map((exportRecord) => [exportRecord.id, exportRecord]))
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]))

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_24rem),linear-gradient(180deg,#050816_0%,#0f172a_100%)] px-4 py-10 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Client delivery
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            {workspace.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            {workspace.summary}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
              <p className="text-sm text-emerald-100">Approved</p>
              <p className="mt-2 text-sm font-medium text-white">
                {workspace.approval_summary.approved_count}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-500/10 p-4">
              <p className="text-sm text-rose-100">Rejected</p>
              <p className="mt-2 text-sm font-medium text-white">
                {workspace.approval_summary.rejected_count}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-100">Pending</p>
              <p className="mt-2 text-sm font-medium text-white">
                {workspace.approval_summary.pending_count}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Finalized</p>
              <p className="mt-2 text-sm font-medium text-white">
                {formatTimestamp(workspace.approval_summary.finalized_at)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Approval summary
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Review note</p>
              <p className="mt-2 text-sm leading-7 text-white">
                {workspace.approval_summary.review_note ?? "No review note recorded."}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Final decision</p>
              <p className="mt-2 text-sm leading-7 text-white">
                {workspace.approval_summary.finalization_note ?? "No final decision note recorded."}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Handoff notes
          </p>
          <p className="mt-4 text-sm leading-8 text-slate-200">
            {workspace.handoff_notes}
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Downloadable assets
          </p>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            {workspaceExports.map((workspaceExport) => {
              const exportRecord = exportsById.get(workspaceExport.export_id) ?? null
              const asset =
                exportRecord?.asset_id
                  ? assetsById.get(exportRecord.asset_id) ?? null
                  : null
              const previewDataUrl =
                asset && typeof asset.metadata.previewDataUrl === "string"
                  ? asset.metadata.previewDataUrl
                  : exportRecord && typeof exportRecord.render_metadata.previewDataUrl === "string"
                    ? exportRecord.render_metadata.previewDataUrl
                    : null
              const isCanonical = exportRecord?.id === workspace.canonical_export_id

              return (
                <article
                  key={workspaceExport.id}
                  className={`overflow-hidden rounded-[2rem] border p-4 ${
                    isCanonical
                      ? "border-emerald-400/30 bg-emerald-500/10"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  {previewDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={workspaceExport.label}
                      className="h-72 w-full rounded-[1.5rem] object-cover"
                      src={previewDataUrl}
                    />
                  ) : (
                    <div className="flex h-72 items-center justify-center rounded-[1.5rem] bg-white/[0.04] text-sm text-slate-400">
                      Preview unavailable
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                      {workspaceExport.label}
                    </span>
                    {exportRecord ? (
                      <>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                          {exportRecord.platform_preset}
                        </span>
                        {isCanonical ? (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                            Canonical
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {exportRecord ? (
                      <a
                        className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                        href={`/api/exports/${exportRecord.id}/download`}
                      >
                        Download asset
                      </a>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
