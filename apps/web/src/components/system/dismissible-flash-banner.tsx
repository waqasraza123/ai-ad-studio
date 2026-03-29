"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

const flashCopy: Record<string, string> = {
  brief_saved: "Project brief saved."
}

type DismissibleFlashBannerProps = {
  className?: string
}

export function DismissibleFlashBanner({ className }: DismissibleFlashBannerProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const flashKey = searchParams.get("flash")
  const message = flashKey ? flashCopy[flashKey] ?? null : null

  const dismiss = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString())
    next.delete("flash")
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }, [pathname, router, searchParams])

  const wrapperClass = useMemo(
    () =>
      [
        "rounded-[1.5rem] border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100",
        className
      ]
        .filter(Boolean)
        .join(" "),
    [className]
  )

  if (!message) {
    return null
  }

  return (
    <div className={wrapperClass} role="status">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>{message}</p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/10"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
