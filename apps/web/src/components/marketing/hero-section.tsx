import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/primitives/button"
import { HeroPreview } from "./hero-preview"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pb-28 lg:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-100">
            <Sparkles className="h-4 w-4" />
            <span>Portfolio-grade AI product ad workflow</span>
          </div>

          <h1 className="mt-8 text-balance text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Brief to premium ad concept to final short-form export
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            AI Ad Studio is a constrained creative system for product ads. It
            turns product images and a short brief into three ad concepts, one
            polished preview per concept, and one final 10-second vertical render.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg">
                Enter dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <a
              href="/api/health"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
            >
              API health
            </a>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  )
}
