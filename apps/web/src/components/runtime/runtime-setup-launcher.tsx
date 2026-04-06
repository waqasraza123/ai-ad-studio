"use client"

import { useEffect, useRef, useState } from "react"
import { Cpu, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RuntimeSetupContext } from "./runtime-setup-content"
import { RUNTIME_SETUP_DISMISSAL_KEY } from "./runtime-setup-content"
import { RuntimeSetupModal } from "./runtime-setup-modal"

type RuntimeSetupLauncherProps = {
  context: RuntimeSetupContext
  autoOpenOnFirstVisit?: boolean
  triggerLabel?: string
  triggerVariant?: "topbar" | "sidebar"
  showTrigger?: boolean
}

export function RuntimeSetupLauncher({
  context,
  autoOpenOnFirstVisit = false,
  triggerLabel = context === "homepage" ? "Runtime setup" : "API & GPU setup",
  triggerVariant = context === "homepage" ? "topbar" : "sidebar",
  showTrigger = true
}: RuntimeSetupLauncherProps) {
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || !autoOpenOnFirstVisit) {
      return
    }

    try {
      if (window.localStorage.getItem(RUNTIME_SETUP_DISMISSAL_KEY) === "1") {
        return
      }
    } catch (error) {
      console.error("RuntimeSetupLauncher failed to read dismissal state", error)
    }

    const timeout = window.setTimeout(() => {
      setOpen(true)
    }, 180)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [autoOpenOnFirstVisit, hydrated])

  function persistDismissal() {
    try {
      window.localStorage.setItem(RUNTIME_SETUP_DISMISSAL_KEY, "1")
    } catch (error) {
      console.error("RuntimeSetupLauncher failed to store dismissal state", error)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setOpen(true)
      return
    }

    persistDismissal()
    setOpen(false)
  }

  return (
    <>
      {showTrigger ? (
        triggerVariant === "sidebar" ? (
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              "theme-palette-panel theme-focus-ring group mt-6 w-full rounded-[1.35rem] border p-4 text-left transition"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="theme-icon-chip flex h-11 w-11 items-center justify-center rounded-2xl border">
                <Cpu className="h-5 w-5 transition group-hover:scale-105" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                  Setup help
                </p>
                <p className="mt-1 text-sm font-medium text-white">{triggerLabel}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  See the recommended API path, local GPU requirements, and ready-to-use
                  `.env.local` blocks.
                </p>
              </div>
            </div>
          </button>
        ) : (
          <button
            ref={triggerRef}
            type="button"
            className="theme-inline-secondary-button theme-focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium"
            onClick={() => setOpen(true)}
          >
            <Settings2 className="h-4 w-4" />
            <span>{triggerLabel}</span>
          </button>
        )
      ) : null}

      {hydrated ? (
        <RuntimeSetupModal
          open={open}
          onOpenChange={handleOpenChange}
          context={context}
          triggerRef={triggerRef}
        />
      ) : null}
    </>
  )
}
