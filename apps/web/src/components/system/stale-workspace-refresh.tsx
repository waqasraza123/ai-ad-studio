"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type StaleWorkspaceRefreshProps = {
  active: boolean
  /** Default 8s — light polling while exports or jobs finish */
  intervalMs?: number
}

const STALE_REFRESH_BACKOFF_MULTIPLIERS = [1, 1, 2, 2, 4] as const

function isDocumentVisible() {
  if (typeof document === "undefined") {
    return true
  }

  return document.visibilityState !== "hidden"
}

export function StaleWorkspaceRefresh({
  active,
  intervalMs = 8000
}: StaleWorkspaceRefreshProps) {
  const router = useRouter()
  const [pageVisible, setPageVisible] = useState(isDocumentVisible)
  const [refreshCount, setRefreshCount] = useState(0)
  const wasPageVisibleRef = useRef(isDocumentVisible())

  useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    const syncVisibility = () => {
      const visible = isDocumentVisible()
      setPageVisible(visible)
    }

    syncVisibility()
    document.addEventListener("visibilitychange", syncVisibility)

    return () => {
      document.removeEventListener("visibilitychange", syncVisibility)
    }
  }, [])

  useEffect(() => {
    if (!active || !pageVisible) {
      setRefreshCount(0)
    }
  }, [active, pageVisible])

  useEffect(() => {
    if (!active) {
      wasPageVisibleRef.current = pageVisible
      return
    }

    if (pageVisible && !wasPageVisibleRef.current) {
      setRefreshCount(0)
      router.refresh()
    }

    wasPageVisibleRef.current = pageVisible
  }, [active, pageVisible, router])

  useEffect(() => {
    if (!active || !pageVisible) {
      return
    }

    const backoffIndex = Math.min(
      refreshCount,
      STALE_REFRESH_BACKOFF_MULTIPLIERS.length - 1
    )
    const nextDelay =
      intervalMs * STALE_REFRESH_BACKOFF_MULTIPLIERS[backoffIndex]!

    const id = window.setTimeout(() => {
      router.refresh()
      setRefreshCount((currentCount) => currentCount + 1)
    }, nextDelay)

    return () => window.clearTimeout(id)
  }, [active, intervalMs, pageVisible, refreshCount, router])

  return null
}
