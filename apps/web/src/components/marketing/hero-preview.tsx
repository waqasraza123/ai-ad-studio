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
    <div className="relative mx-auto mt-10 h-[28rem] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.92))] shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.24),transparent_28rem)]" />
      <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-6 rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5"
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

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
            Live system state
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4">
            <div className="aspect-[9/16] rounded-[1.25rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_16rem),linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,0.92))]" />
            <div className="mt-4 grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/5] rounded-2xl border border-white/10 bg-white/[0.05]"
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
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
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-400/10 text-xs font-semibold text-indigo-200">
                      {index + 1}
                    </div>
                    <p className="text-sm text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Concept summary
              </p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-sm font-medium text-white">
                    Premium reveal with tight product framing
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Designed for premium ecommerce and app launches.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
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
            className={`absolute ${card.className} rounded-[1.25rem] border border-white/10 bg-slate-950/75 p-4 backdrop-blur-xl`}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <Icon className="h-4 w-4 text-indigo-300" />
              <span>{card.label}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-white">{card.title}</p>
          </motion.div>
        )
      })}
    </div>
  )
}
