"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

type StaleWorkspaceRefreshProps = {
  active: boolean
  /** Default 8s — light polling while exports or jobs finish */
  intervalMs?: number
}

export function StaleWorkspaceRefresh({
  active,
  intervalMs = 8000
}: StaleWorkspaceRefreshProps) {
  const router = useRouter()

  useEffect(() => {
    if (!active) {
      return
    }

    const id = window.setInterval(() => {
      router.refresh()
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [active, intervalMs, router])

  return null
}
