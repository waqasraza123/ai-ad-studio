"use client"

import { useI18n } from "@/lib/i18n/provider"

type DashboardRouteSkeletonProps = {
  label?: string
}

export function DashboardRouteSkeleton({
  label
}: DashboardRouteSkeletonProps) {
  const { t } = useI18n()
  const loadingLabel = label ?? t("common.loading.workspace")

  return (
    <div
      className="space-y-6 animate-pulse"
      aria-busy
      aria-label={loadingLabel}
      role="status"
    >
      <div className="h-9 w-56 max-w-[70%] rounded-full bg-white/10" />
      <div className="h-4 w-full max-w-xl rounded-full bg-white/[0.06]" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-44 rounded-[1.75rem] bg-white/[0.06]" />
        <div className="h-44 rounded-[1.75rem] bg-white/[0.06]" />
      </div>
      <div className="h-72 rounded-[1.75rem] bg-white/[0.05]" />
    </div>
  )
}
