import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/primitives/button"
import { HeroPreview } from "./hero-preview"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pb-28 lg:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="theme-accent-pill inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>AI product ad generation workflow</span>
          </div>

          <h1 className="mt-8 text-balance text-5xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
            Brief to premium ad concept to final short-form export
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
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
              className="theme-inline-secondary-button inline-flex h-12 items-center justify-center rounded-full border px-6 text-sm font-medium"
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
