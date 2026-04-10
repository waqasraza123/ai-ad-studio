"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { Cpu, Settings2 } from "lucide-react"
import { useI18n } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"
import type { RuntimeSetupContext } from "./runtime-setup-content"
import { RUNTIME_SETUP_DISMISSAL_KEY } from "./runtime-setup-content"

const RuntimeSetupModal = dynamic(
  () =>
    import("./runtime-setup-modal").then((module) => ({
      default: module.RuntimeSetupModal
    })),
  {
    loading: () => null,
    ssr: false
  }
)

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
  triggerLabel,
  triggerVariant = context === "homepage" ? "topbar" : "sidebar",
  showTrigger = true
}: RuntimeSetupLauncherProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [hasMountedModal, setHasMountedModal] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const resolvedTriggerLabel =
    triggerLabel ??
    (context === "homepage" ? t("runtime.setup") : t("runtime.apiGpuSetup"))

  function openModal() {
    setHasMountedModal(true)
    setOpen(true)
  }

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
      setHasMountedModal(true)
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
      openModal()
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
            onClick={openModal}
            className={cn(
              "theme-palette-panel theme-focus-ring group mt-6 w-full rounded-[1.35rem] border p-4 theme-text-start transition"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="theme-icon-chip flex h-11 w-11 items-center justify-center rounded-2xl border">
                <Cpu className="h-5 w-5 transition group-hover:scale-105" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                  {t("runtime.launcher.sidebarEyebrow")}
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                  {resolvedTriggerLabel}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  {t("runtime.launcherDescription")}
                </p>
              </div>
            </div>
          </button>
        ) : (
          <button
            ref={triggerRef}
            type="button"
            className="theme-inline-secondary-button theme-focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium"
            onClick={openModal}
          >
            <Settings2 className="h-4 w-4" />
            <span>{resolvedTriggerLabel}</span>
          </button>
        )
      ) : null}

      {hydrated && hasMountedModal ? (
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
