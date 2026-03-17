import { Lightbulb } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { ConceptCard } from "./concept-card"

type ConceptViewModel = {
  angle: string
  hook: string
  id: string
  script: string
  status: string
  title: string
}

type ConceptListProps = {
  concepts: ConceptViewModel[]
}

export function ConceptList({ concepts }: ConceptListProps) {
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
        <ConceptCard
          key={concept.id}
          angle={concept.angle}
          hook={concept.hook}
          script={concept.script}
          status={concept.status}
          title={concept.title}
        />
      ))}
    </div>
  )
}
