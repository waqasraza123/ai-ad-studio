import Link from "next/link"
import type {
  ExportAspectRatio,
  PlatformPresetKey,
  RenderVariantKey
} from "@/server/database/types"
import { SurfaceCard } from "@/components/primitives/surface-card"

type ExportCardProps = {
  aspectRatio: ExportAspectRatio
  createdAtLabel: string
  exportId: string
  platformPreset: PlatformPresetKey
  projectName: string
  variantKey: RenderVariantKey
}

export function ExportCard({
  aspectRatio,
  createdAtLabel,
  exportId,
  platformPreset,
  projectName,
  variantKey
}: ExportCardProps) {
  return (
    <Link href={`/dashboard/exports/${exportId}`}>
      <SurfaceCard className="h-full p-5 transition hover:border-white/20 hover:bg-white/[0.06]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">{projectName}</p>
            <p className="mt-2 text-sm text-slate-400">{createdAtLabel}</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
            {aspectRatio}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
            {platformPreset}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
            {variantKey}
          </span>
        </div>
      </SurfaceCard>
    </Link>
  )
}
