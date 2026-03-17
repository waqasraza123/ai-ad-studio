import { ImageIcon } from "lucide-react"
import { selectConceptAction } from "@/features/concepts/actions/select-concept"
import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"

type ConceptPreviewCardProps = {
  angle: string
  hook: string
  id: string
  isSelected: boolean
  previewDataUrl: string | null
  projectId: string
  script: string
  status: string
  title: string
}

export function ConceptPreviewCard({
  angle,
  hook,
  id,
  isSelected,
  previewDataUrl,
  projectId,
  script,
  status,
  title
}: ConceptPreviewCardProps) {
  const action = selectConceptAction.bind(null, projectId, id)

  return (
    <SurfaceCard
      className={isSelected ? "border-indigo-300/40 bg-indigo-500/[0.08] p-5" : "p-5"}
    >
      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04]">
        {previewDataUrl ? (
          <img
            alt={title}
            className="aspect-[4/5] w-full object-cover"
            src={previewDataUrl}
          />
        ) : (
          <div className="grid aspect-[4/5] place-items-center bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.16),transparent_16rem),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.94))]">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                <ImageIcon className="h-5 w-5 text-indigo-200" />
              </div>
              <p className="mt-4 text-sm text-slate-300">Preview pending</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {angle}
          </p>
          <h3 className="mt-3 text-xl font-medium text-white">{title}</h3>
        </div>

        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
          {status}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-white">Hook</p>
        <p className="mt-2 text-sm leading-7 text-slate-300">{hook}</p>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-white">Script</p>
        <p className="mt-2 line-clamp-4 text-sm leading-7 text-slate-400">{script}</p>
      </div>

      <div className="mt-6">
        <form action={action}>
          <Button className="w-full" variant={isSelected ? "secondary" : "primary"}>
            {isSelected ? "Selected concept" : "Select concept"}
          </Button>
        </form>
      </div>
    </SurfaceCard>
  )
}
