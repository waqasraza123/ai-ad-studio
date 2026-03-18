import { createAssetPlaceholderAction } from "@/features/projects/actions/create-asset-placeholder"
import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import type { AssetRecord } from "@/server/database/types"

type ProjectUploadPanelProps = {
  assets: AssetRecord[]
  projectId: string
}

function toAssetSizeLabel(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Unknown size"
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function ProjectUploadPanel({
  assets,
  projectId
}: ProjectUploadPanelProps) {
  const action = createAssetPlaceholderAction.bind(null, projectId)

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Asset intake
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        Register source files for this project
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        This phase persists asset metadata and project association. Actual object
        storage upload wiring lands next without changing the page contract.
      </p>

      <form action={action} className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px_160px]">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Select file</span>
          <input
            name="file"
            type="file"
            className="block h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-amber-500/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-amber-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Asset kind</span>
          <select
            name="kind"
            defaultValue="product_image"
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-amber-300/40"
          >
            <option value="product_image">Product image</option>
            <option value="logo">Logo</option>
          </select>
        </label>

        <div className="flex items-end">
          <Button className="w-full">Register asset</Button>
        </div>
      </form>

      <div className="mt-8 space-y-3">
        {assets.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
            No assets registered yet. Add product images or a logo to prepare the
            project for the next phase.
          </div>
        ) : (
          assets.map((asset) => (
            <div
              key={asset.id}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    {String(asset.metadata.originalFileName ?? asset.storage_key)}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {asset.kind} · {asset.mime_type} ·{" "}
                    {toAssetSizeLabel(asset.metadata.sizeBytes)}
                  </p>
                </div>

                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">
                  {String(asset.metadata.uploadStatus ?? "pending_storage")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </SurfaceCard>
  )
}
