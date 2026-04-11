import { Lightbulb } from "lucide-react"
import { SurfaceCard } from "@/components/primitives/surface-card"
import type { AppMessageKey } from "@/lib/i18n/messages/en"
import { getServerI18n } from "@/lib/i18n/server"
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
  statusKey: AppMessageKey
  title: string
  wasSafetyModified: boolean
}

type ConceptListProps = {
  concepts: ConceptViewModel[]
  projectId: string
}

export async function ConceptList({ concepts, projectId }: ConceptListProps) {
  const { t } = await getServerI18n()

  if (concepts.length === 0) {
    return (
      <SurfaceCard className="p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.05]">
          <Lightbulb className="h-6 w-6 text-amber-200" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-white">
          {t("concepts.list.emptyTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          {t("concepts.list.emptyDescription")}
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
          statusKey={concept.statusKey}
          title={concept.title}
          wasSafetyModified={concept.wasSafetyModified}
        />
      ))}
    </div>
  )
}
