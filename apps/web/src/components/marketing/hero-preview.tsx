"use client"

import { motion, useReducedMotion } from "motion/react"
import { CheckCircle2, Play, Sparkles, WandSparkles } from "lucide-react"

const workflowStages = [
  {
    label: "Brief",
    title: "Normalize the request",
    detail:
      "Product goals, assets, and constraints are locked before generation.",
    icon: WandSparkles
  },
  {
    label: "Concepts",
    title: "Compare directions early",
    detail:
      "Multiple scripts and visual routes are reviewed before final spend.",
    icon: Sparkles
  },
  {
    label: "Previews",
    title: "Approve frames with evidence",
    detail:
      "Teams select the winner from preview-ready frames instead of raw prompts.",
    icon: CheckCircle2
  },
  {
    label: "Promotion",
    title: "Publish the canonical export",
    detail:
      "The approved winner moves into showcase and delivery surfaces intact.",
    icon: Play
  }
]

const exportSummary = [
  {
    label: "Formats",
    value: "9:16, 1:1, 16:9"
  },
  {
    label: "Review lock",
    value: "Owner and external"
  },
  {
    label: "Destinations",
    value: "Showcase and delivery"
  }
]

const destinationCards = [
  {
    label: "Showcase gallery",
    title: "Curated public winners",
    detail: "Approved exports grouped by template, format, and campaign preset.",
    icon: Sparkles
  },
  {
    label: "Delivery handoff",
    title: "Client-ready export package",
    detail: "Canonical files, captions, and notes move into the handoff surface.",
    icon: Play
  }
]

export function HeroPreview() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="theme-preview-shell theme-preview-shell-readable relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border lg:ml-auto">
      <div className="theme-preview-glow absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent)]" />
      <div className="pointer-events-none absolute -right-20 top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgb(var(--preview-glow-rgb)_/_0.2),transparent_68%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 left-8 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgb(var(--page-secondary-glow-rgb)_/_0.14),transparent_72%)] blur-3xl" />

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
        className="theme-surface-card relative z-10 m-4 rounded-[1.75rem] border p-4 shadow-[0_30px_90px_rgb(var(--shadow-rgb)_/_0.14)] sm:m-5 sm:p-5 xl:mb-24 xl:mt-20 2xl:mb-28"
      >
        <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Studio system
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)] sm:text-xl">
              Output pipeline for campaign teams
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
              One approved winner moves from review into public promotion and
              client handoff without reassembling the package for each surface.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="theme-live-pill inline-flex rounded-full border px-3 py-1 text-xs font-medium">
              Review-first workflow
            </div>
            <div className="theme-status-pill inline-flex rounded-full border px-3 py-1 text-xs font-medium">
              Canonical export only
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <div className="theme-preview-panel theme-marketing-card-lift rounded-[1.5rem] border p-4 sm:p-5">
            <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="theme-marketing-eyebrow">Canonical winner</p>
                <h4 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                  Approved campaign package
                </h4>
              </div>
              <div className="theme-accent-pill inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Ready for publish
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.14fr)_minmax(15rem,0.86fr)]">
              <div className="theme-preview-canvas relative overflow-hidden rounded-[1.35rem] border p-4 sm:p-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgb(255_255_255_/_0.42),transparent_44%),linear-gradient(180deg,transparent,rgba(34,21,26,0.06))]" />
                <div className="relative flex min-h-[23rem] flex-col justify-between sm:min-h-[27rem]">
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Winner locked",
                      "Copy and CTA aligned",
                      "Handoff ready"
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[rgb(var(--primary-rgb)_/_0.18)] bg-[rgba(255,255,255,0.72)] px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[var(--soft-foreground)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="max-w-md">
                    <p className="theme-marketing-eyebrow">Active output</p>
                    <p className="mt-3 text-[1.85rem] font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--foreground)] sm:text-[2.2rem]">
                      Final export stays consistent across publish and delivery
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--soft-foreground)]">
                      The approved winner carries framing, captions, and handoff
                      metadata forward as one package instead of splitting into
                      separate downstream versions.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(255,255,255,0.76)] p-4 shadow-[0_18px_42px_rgb(var(--shadow-rgb)_/_0.08)]">
                      <p className="theme-marketing-eyebrow">Campaign master</p>
                      <p className="mt-2 text-sm font-medium leading-6 text-[var(--foreground)]">
                        Headline treatment, CTA emphasis, and framing remain
                        pinned to the winner.
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(255,255,255,0.76)] p-4 shadow-[0_18px_42px_rgb(var(--shadow-rgb)_/_0.08)]">
                      <p className="theme-marketing-eyebrow">Delivery package</p>
                      <p className="mt-2 text-sm font-medium leading-6 text-[var(--foreground)]">
                        Formats, captions, and notes move with the approved
                        export into client handoff.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.25rem] border p-4">
                  <p className="theme-marketing-eyebrow">Release package</p>
                  <div className="mt-4 space-y-3">
                    {exportSummary.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start justify-between gap-4 border-b border-[rgba(15,23,42,0.08)] pb-3 last:border-b-0 last:pb-0"
                      >
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                          {item.label}
                        </p>
                        <p className="max-w-[11rem] text-right text-sm font-medium leading-6 text-[var(--foreground)]">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.25rem] border p-4">
                  <p className="theme-marketing-eyebrow">Why it holds up</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                    Review happens before final promotion, so public showcase,
                    campaign delivery, and handoff surfaces all inherit the same
                    approved asset package.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {["Concept board", "Preview frame", "Export handoff"].map(
                    (label) => (
                      <div
                        key={label}
                        className="theme-soft-panel theme-marketing-card-lift rounded-[1.15rem] border p-3"
                      >
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                          Ready state preserved
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.5rem] border p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="theme-marketing-eyebrow">Workflow checkpoints</p>
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  4 gated phases
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {workflowStages.map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.label}
                      className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(255,255,255,0.62)] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="theme-accent-pill flex h-9 w-9 shrink-0 items-center justify-center rounded-full border">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                            {item.label}
                          </p>
                          <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                            {item.title}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                        {item.detail}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.5rem] border p-4 sm:p-5">
              <p className="theme-marketing-eyebrow">Promotion surfaces</p>
              <div className="mt-4 grid gap-3">
                {destinationCards.map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.label}
                      className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(255,255,255,0.7)] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="theme-status-pill flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                            {item.label}
                          </p>
                          <p className="mt-1 text-base font-semibold text-[var(--foreground)]">
                            {item.title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
