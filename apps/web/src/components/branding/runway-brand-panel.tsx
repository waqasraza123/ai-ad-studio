import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

type RunwayBrandPanelProps = {
  className?: string
  eyebrow?: string
  title?: string
  description?: string
  compact?: boolean
}

export function RunwayBrandPanel({
  className,
  eyebrow = "Runway integration",
  title = "Hosted premium runtime",
  description = "Runway is the fastest supported hosted path for premium previews and scene-video generation. Hybrid and local HTTP modes are also available when the environment supports them.",
  compact = false,
}: RunwayBrandPanelProps) {
  return (
    <a
      href="https://runwayml.com/"
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group block rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 transition hover:border-amber-300/30 hover:bg-white/[0.055]",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <img
            src="/brand/runway-icon.png"
            alt="Runway logo"
            className="h-8 w-8 rounded-xl"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            {eyebrow}
          </p>
          <p className="mt-1 text-sm font-medium text-white">{title}</p>
          {description ? (
            <p
              className={cn(
                "mt-2 text-sm leading-6 text-slate-400",
                compact ? "max-w-sm" : "max-w-xl"
              )}
            >
              {description}
            </p>
          ) : null}
        </div>

        <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-amber-200" />
      </div>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-100">
        <span>Visit runwayml.com</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </div>
    </a>
  )
}
