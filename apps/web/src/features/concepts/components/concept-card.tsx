import { SurfaceCard } from "@/components/primitives/surface-card"

type ConceptCardProps = {
  angle: string
  hook: string
  script: string
  status: string
  title: string
}

export function ConceptCard({
  angle,
  hook,
  script,
  status,
  title
}: ConceptCardProps) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-start justify-between gap-3">
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
        <p className="mt-2 text-sm leading-7 text-slate-400">{script}</p>
      </div>
    </SurfaceCard>
  )
}
