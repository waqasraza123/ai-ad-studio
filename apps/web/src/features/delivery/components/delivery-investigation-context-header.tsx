import type { DeliveryInvestigationContextSummary } from "@/features/delivery/lib/delivery-investigation-context-summary"

type DeliveryInvestigationContextHeaderProps = {
  summary: DeliveryInvestigationContextSummary
}

function getToneClasses(tone: DeliveryInvestigationContextSummary["tone"]) {
  if (tone === "rose") {
    return {
      badge: "border-rose-400/30 bg-rose-500/10 text-rose-200",
      card: "border-rose-400/20 bg-rose-500/[0.08]",
      eyebrow: "text-rose-200",
      text: "text-rose-50/90"
    }
  }

  if (tone === "emerald") {
    return {
      badge: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
      card: "border-emerald-400/20 bg-emerald-500/[0.08]",
      eyebrow: "text-emerald-200",
      text: "text-emerald-50/90"
    }
  }

  return {
    badge: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    card: "border-amber-400/20 bg-amber-500/[0.08]",
    eyebrow: "text-amber-200",
    text: "text-amber-50/90"
  }
}

export function DeliveryInvestigationContextHeader({
  summary
}: DeliveryInvestigationContextHeaderProps) {
  const toneClasses = getToneClasses(summary.tone)

  return (
    <section
      className={`rounded-[1.5rem] border p-4 ${toneClasses.card}`}
    >
      <p className={`text-sm uppercase tracking-[0.22em] ${toneClasses.eyebrow}`}>
        Why this view matters
      </p>

      <h2 className="mt-2 text-xl font-semibold text-white">
        {summary.title}
      </h2>

      <p className={`mt-3 text-sm leading-6 ${toneClasses.text}`}>
        {summary.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {summary.badges.map((badge) => (
          <span
            key={badge}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${toneClasses.badge}`}
          >
            {badge}
          </span>
        ))}
      </div>
    </section>
  )
}
