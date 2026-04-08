"use client"

import { motion, useReducedMotion } from "motion/react"
import { CheckCircle2, Play, Sparkles, WandSparkles } from "lucide-react"

const floatingCards = [
  {
    delay: 0,
    label: "Approved winner",
    title: "Canonical export promoted to campaign surfaces",
    icon: Sparkles,
    className: "left-5 top-5 hidden 2xl:block"
  },
  {
    delay: 0.12,
    label: "Preview review",
    title: "Concepts screened before final spend",
    icon: WandSparkles,
    className: "right-5 top-5 hidden xl:block"
  },
  {
    delay: 0.24,
    label: "Client handoff",
    title: "Delivery workspace and public showcase ready",
    icon: Play,
    className: "bottom-5 left-7 hidden xl:block"
  }
]

export function HeroPreview() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="theme-preview-shell theme-preview-shell-readable relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border lg:ml-auto">
      <div className="theme-preview-glow absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent)]" />

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
        className="theme-surface-card relative z-10 m-4 rounded-[1.75rem] border p-4 shadow-[0_30px_90px_rgb(var(--shadow-rgb)_/_0.14)] sm:m-5 sm:p-5 xl:mb-24 xl:mt-20 2xl:mb-28"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Studio system
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)] sm:text-xl">
              Output pipeline for campaign teams
            </h3>
          </div>

          <div className="theme-live-pill hidden rounded-full border px-3 py-1 text-xs font-medium sm:block">
            Review-first workflow
          </div>
        </div>

        <div className="theme-preview-content-grid mt-6">
          <div className="theme-preview-panel theme-marketing-card-lift rounded-[1.5rem] border p-4">
            <div className="grid gap-4 2xl:grid-cols-[0.96fr_1.04fr]">
              <div className="theme-preview-canvas aspect-[4/5] rounded-[1.25rem] border sm:aspect-[9/13] 2xl:aspect-[9/16]" />
              <div className="space-y-3">
                <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.2rem] border p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                    Active winner
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                    Flagship launch winner with publish-ready framing
                  </p>
                  <p className="theme-preview-support-copy mt-2 text-sm text-[var(--muted-foreground)]">
                    Final export keeps captions, CTA treatment, and delivery
                    metadata aligned across public surfaces.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {["Concept board", "Preview frame", "Delivery export"].map(
                    (label) => (
                    <div
                      key={label}
                      className="theme-soft-panel theme-marketing-card-lift aspect-[4/4.4] rounded-[1.15rem] border p-3"
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        {label}
                      </p>
                    </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Formats",
                  value: "9:16, 1:1, 16:9"
                },
                {
                  label: "Handoff",
                  value: "Showcase + delivery"
                },
                {
                  label: "Review",
                  value: "External + owner controlled"
                }
              ].map((item) => (
                <div
                  key={item.label}
                  className="theme-soft-panel theme-marketing-card-lift rounded-[1.15rem] border p-3"
                >
                  <p className="theme-marketing-eyebrow">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.5rem] border p-4">
              <p className="theme-marketing-eyebrow">Buyer-facing process</p>
              <div className="mt-4 space-y-3">
                {[
                  "Marketing brief normalized into a constrained request",
                  "Distinct concepts and scripts generated for review",
                  "Preview frames approved before final budget is committed",
                  "Winning export promoted to publish and delivery surfaces"
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="theme-accent-pill mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="theme-preview-process-copy text-sm text-[var(--soft-foreground)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.5rem] border p-4">
              <p className="theme-marketing-eyebrow">Promotion surfaces</p>
              <div className="mt-4 space-y-3">
                <div className="theme-soft-panel theme-marketing-card-lift rounded-2xl border p-3">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Public showcase gallery
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Curated winners grouped by template, format, and platform
                    preset.
                  </p>
                </div>
                <div className="theme-soft-panel theme-marketing-card-lift rounded-2xl border p-3">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Campaign and delivery handoff
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Move the canonical export into client-facing delivery and
                    campaign surfaces.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {floatingCards.map((card) => {
        const Icon = card.icon

        return (
          <motion.div
            key={card.label}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 1, y: [0, -8, 0] }
            }
            transition={{
              delay: card.delay,
              duration: shouldReduceMotion ? 0 : 6.5,
              repeat: shouldReduceMotion ? 0 : Infinity,
              repeatType: "mirror"
            }}
            className={`theme-floating-card theme-floating-card-safe absolute z-0 ${card.className} rounded-[1.25rem] border p-4 backdrop-blur-xl`}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              <Icon className="h-4 w-4 text-[rgb(var(--accent-rgb))]" />
              <span>{card.label}</span>
            </div>
            <p className="mt-3 text-sm font-medium leading-6 text-[var(--foreground)]">
              {card.title}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
