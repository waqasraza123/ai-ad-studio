import { generateConceptPreviewsAction } from "@/features/concepts/actions/generate-concept-previews"
import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"

type GenerateConceptPreviewsPanelProps = {
  description: string
  isBlocked: boolean
  label: string
  projectId: string
}

export function GenerateConceptPreviewsPanel({
  description,
  isBlocked,
  label,
  projectId
}: GenerateConceptPreviewsPanelProps) {
  const action = generateConceptPreviewsAction.bind(null, projectId)

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Concept previews
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          Visual concept previews
        </h2>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
          {label}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>

      <form action={action} className="mt-6">
        <Button disabled={isBlocked}>
          {isBlocked ? "Preview generation unavailable" : "Generate previews"}
        </Button>
      </form>
    </SurfaceCard>
  )
}
