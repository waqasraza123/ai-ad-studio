import { Lightbulb } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { ConceptPreviewCard } from "./concept-preview-card"

type ConceptViewModel = {
  angle: string
  hook: string
  id: string
  isSelected: boolean
  previewDataUrl: string | null
  riskFlags: string[]
  safetyNotes: string | null
  script: string
  status: string
  title: string
  wasSafetyModified: boolean
}

type ConceptListProps = {
  concepts: ConceptViewModel[]
  projectId: string
}

export function ConceptList({ concepts, projectId }: ConceptListProps) {
  if (concepts.length === 0) {
    return (
      <SurfaceCard className="p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.05]">
          <Lightbulb className="h-6 w-6 text-indigo-200" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-white">
          No concepts yet
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          Save the brief, queue a generation job, run the worker, and refresh this
          page to see the first concept set land here.
        </p>
      </SurfaceCard>
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {concepts.map((concept) => (
        <ConceptPreviewCard
          key={concept.id}
          angle={concept.angle}
          hook={concept.hook}
          id={concept.id}
          isSelected={concept.isSelected}
          previewDataUrl={concept.previewDataUrl}
          projectId={projectId}
          riskFlags={concept.riskFlags}
          safetyNotes={concept.safetyNotes}
          script={concept.script}
          status={concept.status}
          title={concept.title}
          wasSafetyModified={concept.wasSafetyModified}
        />
      ))}
    </div>
  )
}
