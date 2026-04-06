"use client"

import { motion } from "motion/react"
import { Play, Sparkles, WandSparkles } from "lucide-react"

const floatingCards = [
  {
    delay: 0,
    label: "Concept 01",
    title: "Premium product reveal",
    icon: Sparkles,
    className: "left-0 top-6 w-52"
  },
  {
    delay: 0.12,
    label: "Concept 02",
    title: "Fast offer ad",
    icon: WandSparkles,
    className: "right-2 top-0 w-48"
  },
  {
    delay: 0.24,
    label: "Export",
    title: "10s 9:16 render ready",
    icon: Play,
    className: "bottom-2 left-12 w-56"
  }
]

export function HeroPreview() {
  return (
    <div className="theme-preview-shell relative mx-auto mt-10 h-[28rem] w-full max-w-5xl overflow-hidden rounded-[2rem] border">
      <div className="theme-preview-glow absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="theme-surface-card absolute inset-6 rounded-[1.75rem] border p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Studio preview
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Concept to export workflow
            </h3>
          </div>

          <div className="theme-live-pill rounded-full border px-3 py-1 text-xs font-medium">
            Live system state
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="theme-preview-panel rounded-[1.5rem] border p-4">
            <div className="theme-preview-canvas aspect-[9/16] rounded-[1.25rem] border" />
            <div className="mt-4 grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="theme-soft-panel aspect-[4/5] rounded-2xl border"
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="theme-soft-panel rounded-[1.5rem] border p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Generation stages
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "Brief normalized",
                  "3 concepts drafted",
                  "Preview frame generation",
                  "Final 10s render queued"
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="theme-accent-pill flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-sm text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="theme-soft-panel rounded-[1.5rem] border p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Concept summary
              </p>
              <div className="mt-4 space-y-3">
                <div className="theme-soft-panel rounded-2xl border p-3">
                  <p className="text-sm font-medium text-white">
                    Premium reveal with tight product framing
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Designed for premium ecommerce and app launches.
                  </p>
                </div>
                <div className="theme-soft-panel rounded-2xl border p-3">
                  <p className="text-sm font-medium text-white">
                    Direct-response offer ad with visual urgency
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Built for CTA-focused campaigns and promo drops.
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
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{
              delay: card.delay,
              duration: 5.5,
              repeat: Infinity,
              repeatType: "mirror"
            }}
            className={`theme-floating-card absolute ${card.className} rounded-[1.25rem] border p-4 backdrop-blur-xl`}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <Icon className="h-4 w-4 text-[rgb(var(--accent-rgb))]" />
              <span>{card.label}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-white">{card.title}</p>
          </motion.div>
        )
      })}
    </div>
  )
}
