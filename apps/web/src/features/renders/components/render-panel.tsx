import Link from "next/link"
import { renderProjectAction } from "@/features/renders/actions/render-project"
import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"

type RenderPanelProps = {
  latestExportId: string | null
  projectId: string
  renderJobLabel: string
  renderJobDescription: string
  selectedConceptTitle: string | null
}

export function RenderPanel({
  latestExportId,
  projectId,
  renderJobDescription,
  renderJobLabel,
  selectedConceptTitle
}: RenderPanelProps) {
  const action = renderProjectAction.bind(null, projectId)
  const isBlocked = renderJobLabel === "Queued" || renderJobLabel === "Running"
  const canRender = Boolean(selectedConceptTitle)

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Final render
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          Export pipeline scaffold
        </h2>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
          {renderJobLabel}
        </span>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {renderJobDescription}
      </p>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-slate-400">Selected concept</p>
        <p className="mt-2 text-sm font-medium text-white">
          {selectedConceptTitle ?? "No concept selected yet"}
        </p>
      </div>

      <form action={action} className="mt-6">
        <Button disabled={!canRender || isBlocked}>
          {!canRender
            ? "Select a concept first"
            : isBlocked
              ? "Render in progress"
              : "Render project"}
        </Button>
      </form>

      {latestExportId ? (
        <div className="mt-6">
          <Link
            href={`/dashboard/exports/${latestExportId}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-500/10 px-5 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/20"
          >
            Open latest export
          </Link>
        </div>
      ) : null}
    </SurfaceCard>
  )
}
