"use client"

import { motion, useReducedMotion } from "motion/react"
import { CheckCircle2, Play, Sparkles, WandSparkles } from "lucide-react"

const floatingCards = [
  {
    delay: 0,
    label: "Approved winner",
    title: "Canonical export promoted to campaign surfaces",
    icon: Sparkles,
    className: "left-0 top-6 w-60"
  },
  {
    delay: 0.12,
    label: "Preview review",
    title: "Concepts screened before final render spend",
    icon: WandSparkles,
    className: "right-2 top-0 w-60"
  },
  {
    delay: 0.24,
    label: "Client handoff",
    title: "Delivery workspace and public showcase ready",
    icon: Play,
    className: "bottom-3 left-12 w-64"
  }
]

export function HeroPreview() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="theme-preview-shell relative mx-auto h-[34rem] w-full max-w-5xl overflow-hidden rounded-[2rem] border lg:ml-auto">
      <div className="theme-preview-glow absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent)]" />

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
        className="theme-surface-card absolute inset-5 rounded-[1.75rem] border p-5 shadow-[0_30px_90px_rgb(var(--shadow-rgb)_/_0.14)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Studio system
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
              Output pipeline for campaign teams
            </h3>
          </div>

          <div className="theme-live-pill rounded-full border px-3 py-1 text-xs font-medium">
            Review-first workflow
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
          <div className="theme-preview-panel theme-marketing-card-lift rounded-[1.5rem] border p-4">
            <div className="grid gap-4 lg:grid-cols-[0.96fr_1.04fr]">
              <div className="theme-preview-canvas aspect-[9/16] rounded-[1.25rem] border" />
              <div className="space-y-3">
                <div className="theme-soft-panel theme-marketing-card-lift rounded-[1.2rem] border p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                    Active winner
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                    Premium cinematic reveal for a flagship product launch
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    Final output carries template framing, captions, CTA
                    treatment, and publish-ready metadata.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Concept board",
                    "Preview frame",
                    "Campaign cover",
                    "Delivery export"
                  ].map((label) => (
                    <div
                      key={label}
                      className="theme-soft-panel theme-marketing-card-lift aspect-[4/4.4] rounded-[1.15rem] border p-3"
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        {label}
                      </p>
                    </div>
                  ))}
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
                  "Marketing brief normalized into a constrained ad request",
                  "Concepts generated with distinct angles and scripts",
                  "Preview frames reviewed before final budget is committed",
                  "Winning export promoted to public and delivery surfaces"
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="theme-accent-pill mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-6 text-[var(--soft-foreground)]">
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
                    Curated winner outputs grouped by template, format, and
                    platform preset.
                  </p>
                </div>
                <div className="theme-soft-panel theme-marketing-card-lift rounded-2xl border p-3">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Campaign and delivery handoff
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Move the canonical export into client-facing public delivery
                    surfaces.
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
              duration: shouldReduceMotion ? 0 : 5.5,
              repeat: shouldReduceMotion ? 0 : Infinity,
              repeatType: "mirror"
            }}
            className={`theme-floating-card theme-marketing-card-lift absolute ${card.className} rounded-[1.25rem] border p-4 backdrop-blur-xl`}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              <Icon className="h-4 w-4 text-[rgb(var(--accent-rgb))]" />
              <span>{card.label}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
              {card.title}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
