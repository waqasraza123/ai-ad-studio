"use client"

import { useEffect } from "react"

type DashboardErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error)
    }
  }, [error])

  return (
    <div className="mx-auto flex min-h-[40vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-12 text-center text-slate-100">
      <h1 className="text-xl font-semibold tracking-tight">Dashboard hit a snag</h1>
      <p className="text-sm leading-relaxed text-slate-400">
        Try again or go back. Your session should still be active.
      </p>
      {process.env.NODE_ENV === "development" && error.digest ? (
        <p className="font-mono text-xs text-slate-500">{error.digest}</p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Try again
        </button>
        <a
          href="/dashboard"
          className="rounded-full border border-amber-400/25 bg-amber-500/10 px-5 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
        >
          Dashboard home
        </a>
      </div>
    </div>
  )
}
