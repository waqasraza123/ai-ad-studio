"use client"

import { useEffect } from "react"
import { useI18n } from "@/lib/i18n/provider"

type AppErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AppError({ error, reset }: AppErrorProps) {
  const { t } = useI18n()

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error)
    }
  }, [error])

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center text-slate-100">
      <h1 className="text-xl font-semibold tracking-tight">{t("errors.app.title")}</h1>
      <p className="text-sm leading-relaxed text-slate-400">
        {t("errors.app.description")}
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
          {t("common.actions.tryAgain")}
        </button>
        <a
          href="/dashboard"
          className="rounded-full border border-amber-400/25 bg-amber-500/10 px-5 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
        >
          {t("common.actions.backToDashboard")}
        </a>
      </div>
    </div>
  )
}
