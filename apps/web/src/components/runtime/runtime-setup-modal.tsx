"use client"

import Link from "next/link"
import { useEffect, useId, useMemo, useRef, useState, type RefObject } from "react"
import { createPortal } from "react-dom"
import {
  AnimatePresence,
  motion,
  useReducedMotion
} from "motion/react"
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CircleOff,
  Cloud,
  Copy,
  Cpu,
  ExternalLink,
  Sparkles,
  TerminalSquare,
  X
} from "lucide-react"
import { useI18n } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"
import type {
  RuntimeModeDefinition,
  RuntimeSetupContext
} from "./runtime-setup-content"
import {
  machineRecommendations,
  RUNTIME_SETUP_GUIDE_URL,
  runtimeModeDefinitions,
  workerEnvExportLines
} from "./runtime-setup-content"

type RuntimeSetupModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  context: RuntimeSetupContext
  triggerRef?: RefObject<HTMLElement | null>
}

const cardIconMap = {
  hosted: Cloud,
  hybrid: Sparkles,
  local: Cpu
} as const

const modeIconMap = {
  runway: Cloud,
  hybrid: Sparkles,
  local: Cpu,
  mock: CircleOff
} as const

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return []
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("disabled"))
}

export function RuntimeSetupModal({
  open,
  onOpenChange,
  context,
  triggerRef
}: RuntimeSetupModalProps) {
  const { t } = useI18n()
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [selectedModeId, setSelectedModeId] = useState<
    (typeof runtimeModeDefinitions)[number]["id"]
  >("runway")
  const [copiedModeId, setCopiedModeId] = useState<string | null>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  const selectedMode = useMemo<RuntimeModeDefinition>(() => {
    const fallbackMode = runtimeModeDefinitions[0]!

    return (
      runtimeModeDefinitions.find((mode) => mode.id === selectedModeId) ?? fallbackMode
    )
  }, [selectedModeId])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open || !mounted) {
      return
    }

    previousActiveElementRef.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onOpenChange(false)
        return
      }

      if (event.key !== "Tab") {
        return
      }

      const focusableElements = getFocusableElements(surfaceRef.current)
      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      if (!firstElement || !lastElement) {
        event.preventDefault()
        return
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)

      const nextFocusTarget =
        triggerRef?.current ?? previousActiveElementRef.current
      nextFocusTarget?.focus?.()
    }
  }, [mounted, onOpenChange, open, triggerRef])

  useEffect(() => {
    if (!copiedModeId) {
      return
    }

    const timeout = window.setTimeout(() => {
      setCopiedModeId(null)
    }, 1800)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [copiedModeId])

  async function copySnippet(modeId: string, lines: string[]) {
    try {
      await navigator.clipboard.writeText(lines.join("\n"))
      setCopiedModeId(modeId)
    } catch (error) {
      console.error("RuntimeSetupModal failed to copy env snippet", error)
    }
  }

  if (!mounted) {
    return null
  }

  const primaryAction =
    context === "homepage"
      ? {
          href: "/dashboard",
          label: t("runtime.modal.enterDashboard")
        }
      : null

  const runwayUpgradeStepsLocalized = [
    t("runtime.runwayUpgrade.stepOne"),
    t("runtime.runwayUpgrade.stepTwo"),
    t("runtime.runwayUpgrade.stepThree"),
    t("runtime.runwayUpgrade.stepFour")
  ]

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: "easeOut" }}
        >
          <motion.div
            className="runtime-setup-backdrop absolute inset-0"
            onClick={() => onOpenChange(false)}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" }}
          >
            <div className="runtime-setup-orb runtime-setup-orb-primary" />
            <div className="runtime-setup-orb runtime-setup-orb-secondary" />
            <div className="runtime-setup-noise absolute inset-0" />
          </motion.div>

          <motion.div
            ref={surfaceRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="theme-runtime-surface relative z-[1] flex max-h-[92vh] w-full max-w-[1280px] flex-col overflow-hidden rounded-[2rem] border backdrop-blur-2xl"
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 18, scale: 0.985 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 14, scale: 0.99 }
            }
            transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgb(var(--page-glow-rgb)_/_0.12),transparent_24rem),radial-gradient(circle_at_85%_10%,rgb(var(--page-secondary-glow-rgb)_/_0.08),transparent_18rem)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--foreground)_35%,transparent),transparent)]" />

            <div className="relative flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--accent-tertiary-rgb))]">
                  {t("runtime.modal.title")}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {t("runtime.modal.description")}
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => onOpenChange(false)}
                className="theme-runtime-secondary-button theme-focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border transition"
                aria-label={t("runtime.modal.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="overflow-y-auto border-b border-[var(--border)] px-5 py-5 sm:px-6 lg:border-b-0 lg:px-8 lg:py-7 lg:[border-inline-end:1px_solid_var(--border)]">
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--primary-rgb)_/_0.22)] bg-[rgb(var(--primary-rgb)_/_0.1)] px-4 py-2 text-sm text-[rgb(var(--accent-tertiary-rgb))]">
                    <Sparkles className="h-4 w-4" />
                    <span>{t("runtime.modal.heroPill")}</span>
                  </div>

                  <h2
                    id={titleId}
                    className="mt-6 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-[2.85rem]"
                  >
                    {t("runtime.modal.heroTitle")}
                  </h2>
                  <p
                    id={descriptionId}
                    className="mt-5 max-w-2xl text-sm leading-7 text-[var(--soft-foreground)] sm:text-[15px]"
                  >
                    {t("runtime.modal.heroDescription")}
                  </p>
                </motion.div>

                <motion.div
                  className="mt-7 grid gap-3"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.24,
                    delay: shouldReduceMotion ? 0 : 0.05
                  }}
                >
                  {machineRecommendations.map((item) => {
                    const Icon = cardIconMap[item.id as keyof typeof cardIconMap]

                    return (
                      <div
                        key={item.id}
                        className="theme-runtime-soft-panel rounded-[1.6rem] border p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="theme-icon-chip flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--foreground)]">
                              {item.id === "hosted"
                                ? t("runtime.machine.hosted.label")
                                : item.id === "hybrid"
                                  ? t("runtime.machine.hybrid.label")
                                  : t("runtime.machine.local.label")}
                            </p>
                            <p className="mt-1 text-sm text-[var(--soft-foreground)]">
                              {item.id === "hosted"
                                ? t("runtime.machine.hosted.summary")
                                : item.id === "hybrid"
                                  ? t("runtime.machine.hybrid.summary")
                                  : t("runtime.machine.local.summary")}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                              {item.id === "hosted"
                                ? t("runtime.machine.hosted.detail")
                                : item.id === "hybrid"
                                  ? t("runtime.machine.hybrid.detail")
                                  : t("runtime.machine.local.detail")}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </motion.div>

                <motion.div
                  className="theme-accent-panel mt-7 rounded-[1.8rem] border p-5"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.24,
                    delay: shouldReduceMotion ? 0 : 0.1
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="theme-icon-chip flex h-11 w-11 items-center justify-center rounded-2xl border">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {t("runtime.runwayUpgrade.title")}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--soft-foreground)]">
                        {t("runtime.runwayUpgrade.description")}
                      </p>
                    </div>
                  </div>

                  <ol className="mt-4 space-y-3">
                    {runwayUpgradeStepsLocalized.map((step, index) => (
                      <li key={step} className="flex items-start gap-3 text-sm text-[var(--soft-foreground)]">
                        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background-strong)] text-xs font-semibold text-[var(--foreground)]">
                          {index + 1}
                        </span>
                        <span className="leading-6">{step}</span>
                      </li>
                    ))}
                  </ol>
                </motion.div>

                <motion.div
                  className="theme-runtime-code-block mt-7 rounded-[1.6rem] border p-4"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.24,
                    delay: shouldReduceMotion ? 0 : 0.15
                  }}
                >
                  <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                    <TerminalSquare className="h-4 w-4 text-[rgb(var(--accent-rgb))]" />
                    <span>{t("runtime.modal.workerExportLabel")}</span>
                  </div>

                  <div className="theme-runtime-code-block mt-4 overflow-hidden rounded-[1.2rem] border">
                    <div className="theme-runtime-code-header flex items-center gap-2 border-b px-4 py-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                      <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)] [margin-inline-start:0.75rem]">
                        {t("runtime.modal.shellSession")}
                      </span>
                    </div>
                    <pre className="overflow-x-auto px-4 py-4 text-sm leading-7 text-[var(--soft-foreground)]">
                      <code>{workerEnvExportLines.join("\n")}</code>
                    </pre>
                  </div>
                </motion.div>
              </div>

              <div className="flex min-h-0 flex-col overflow-y-auto px-5 py-5 sm:px-6 lg:px-8 lg:py-7">
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.22, delay: 0.04 }}
                >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                      <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                        {t("runtime.modal.supportedModesEyebrow")}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                        {t("runtime.modal.supportedModesTitle")}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {runtimeModeDefinitions.map((mode, index) => {
                      const Icon = modeIconMap[mode.id]
                      const isSelected = mode.id === selectedMode.id

                      return (
                        <motion.button
                          key={mode.id}
                          type="button"
                          onClick={() => setSelectedModeId(mode.id)}
                          className={cn(
                            "theme-focus-ring theme-text-start group relative overflow-hidden rounded-[1.6rem] border p-4 transition",
                            isSelected
                              ? "border-[rgb(var(--primary-rgb)_/_0.3)] bg-[linear-gradient(180deg,rgb(var(--primary-rgb)_/_0.16),color-mix(in_srgb,var(--background-strong)_70%,transparent))] shadow-[0_20px_48px_rgb(var(--primary-rgb)_/_0.14)]"
                              : "theme-runtime-soft-panel hover:border-[var(--border-strong)] hover:bg-[var(--background-strong)]",
                            mode.muted ? "opacity-90" : null
                          )}
                          aria-pressed={isSelected}
                          initial={
                            shouldReduceMotion ? false : { opacity: 0, y: 10 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: shouldReduceMotion ? 0 : 0.2,
                            delay: shouldReduceMotion ? 0 : 0.05 + index * 0.03
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="theme-icon-chip flex h-11 w-11 items-center justify-center rounded-2xl border">
                              <Icon className="h-5 w-5" />
                            </div>
                            <span
                              className={cn(
                                "rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.24em]",
                                mode.recommended
                                  ? "border-[rgb(var(--primary-rgb)_/_0.25)] bg-[rgb(var(--primary-rgb)_/_0.1)] text-[rgb(var(--accent-tertiary-rgb))]"
                                  : mode.experimental
                                    ? "border-rose-300/20 bg-rose-400/10 text-rose-100"
                                    : "border-[var(--border)] bg-[var(--background-soft)] text-[var(--muted-foreground)]"
                              )}
                            >
                              {mode.id === "runway"
                                ? t("runtime.modes.runway.eyebrow")
                                : mode.id === "hybrid"
                                  ? t("runtime.modes.hybrid.eyebrow")
                                  : mode.id === "local"
                                    ? t("runtime.modes.local.eyebrow")
                                    : t("runtime.modes.mock.eyebrow")}
                            </span>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm font-medium text-[var(--foreground)]">
                              {mode.id === "runway"
                                ? t("runtime.modes.runway.label")
                                : mode.id === "hybrid"
                                  ? t("runtime.modes.hybrid.label")
                                  : mode.id === "local"
                                    ? t("runtime.modes.local.label")
                                    : t("runtime.modes.mock.label")}
                            </p>
                            <p className="mt-1 text-sm text-[var(--soft-foreground)]">
                              {mode.id === "runway"
                                ? t("runtime.modes.runway.summary")
                                : mode.id === "hybrid"
                                  ? t("runtime.modes.hybrid.summary")
                                  : mode.id === "local"
                                    ? t("runtime.modes.local.summary")
                                    : t("runtime.modes.mock.summary")}
                            </p>
                            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                              {mode.id === "runway"
                                ? t("runtime.modes.runway.detail")
                                : mode.id === "hybrid"
                                  ? t("runtime.modes.hybrid.detail")
                                  : mode.id === "local"
                                    ? t("runtime.modes.local.detail")
                                    : t("runtime.modes.mock.detail")}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                            <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                              {mode.id === "runway"
                                ? t("runtime.modes.runway.compatibility")
                                : mode.id === "hybrid"
                                  ? t("runtime.modes.hybrid.compatibility")
                                  : mode.id === "local"
                                    ? t("runtime.modes.local.compatibility")
                                    : t("runtime.modes.mock.compatibility")}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--accent-tertiary-rgb))]">
                              {t("runtime.modal.openConfig")}
                              <ChevronRight className="theme-directional-icon h-3.5 w-3.5" />
                            </span>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>

                <motion.div
                  className="theme-runtime-soft-panel mt-6 flex min-h-0 flex-1 flex-col rounded-[1.9rem] border"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.24,
                    delay: shouldReduceMotion ? 0 : 0.16
                  }}
                >
                  <div className="border-b border-[var(--border)] px-5 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                          {t("runtime.modal.editEnv")}
                        </p>
                        <h4 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                          {selectedMode.id === "runway"
                            ? t("runtime.modes.runway.label")
                            : selectedMode.id === "hybrid"
                              ? t("runtime.modes.hybrid.label")
                              : selectedMode.id === "local"
                                ? t("runtime.modes.local.label")
                                : t("runtime.modes.mock.label")}
                        </h4>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--soft-foreground)]">
                          {selectedMode.id === "runway"
                            ? t("runtime.modes.runway.highlight")
                            : selectedMode.id === "hybrid"
                              ? t("runtime.modes.hybrid.highlight")
                              : selectedMode.id === "local"
                                ? t("runtime.modes.local.highlight")
                                : t("runtime.modes.mock.highlight")}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => copySnippet(selectedMode.id, selectedMode.envLines)}
                        className="theme-runtime-secondary-button theme-focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition"
                      >
                        <Copy className="h-4 w-4" />
                        <span>
                          {copiedModeId === selectedMode.id
                            ? t("runtime.modal.copied")
                            : t("runtime.modal.copyEnvBlock")}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid min-h-0 flex-1 gap-0 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="min-h-0 border-b border-[var(--border)] px-5 py-5 xl:border-b-0 xl:[border-inline-end:1px_solid_var(--border)]">
                      <div className="theme-runtime-code-block h-full overflow-hidden rounded-[1.4rem] border">
                        <div className="theme-runtime-code-header flex items-center justify-between border-b px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                            <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)] [margin-inline-start:0.5rem]">
                              .env.local
                            </span>
                          </div>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {t("runtime.modal.currentSupportOnly")}
                          </span>
                        </div>
                        <pre className="h-full overflow-auto px-4 py-4 text-sm leading-7 text-[var(--soft-foreground)]">
                          <code>{selectedMode.envLines.join("\n")}</code>
                        </pre>
                      </div>
                    </div>

                    <div className="px-5 py-5">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                        {t("runtime.modal.whyThisMode")}
                      </p>
                      <ul className="mt-4 space-y-3">
                        {[
                          selectedMode.id === "runway"
                            ? t("runtime.modes.runway.noteOne")
                            : selectedMode.id === "hybrid"
                              ? t("runtime.modes.hybrid.noteOne")
                              : selectedMode.id === "local"
                                ? t("runtime.modes.local.noteOne")
                                : t("runtime.modes.mock.noteOne"),
                          selectedMode.id === "runway"
                            ? t("runtime.modes.runway.noteTwo")
                            : selectedMode.id === "hybrid"
                              ? t("runtime.modes.hybrid.noteTwo")
                              : selectedMode.id === "local"
                                ? t("runtime.modes.local.noteTwo")
                                : t("runtime.modes.mock.noteTwo")
                        ].map((note) => (
                          <li key={note} className="flex items-start gap-3 text-sm text-[var(--soft-foreground)]">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--accent-rgb))]" />
                            <span className="leading-6">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="theme-runtime-soft-panel mt-6 rounded-[1.5rem] border px-4 py-3 text-sm text-[var(--soft-foreground)]"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.22,
                    delay: shouldReduceMotion ? 0 : 0.2
                  }}
                >
                  {t("runtime.modal.additionalSupportNote")}
                </motion.div>
              </div>
            </div>

            <div className="relative border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--background-deep)_84%,transparent)] px-5 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="max-w-2xl text-sm text-[var(--muted-foreground)]">
                  {t("runtime.modal.footerDescription")}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {primaryAction ? (
                    <Link
                      href={primaryAction.href}
                      onClick={() => onOpenChange(false)}
                      className="theme-runtime-primary-button inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium transition"
                    >
                      <span>{primaryAction.label}</span>
                      <ArrowUpRight className="theme-directional-icon h-4 w-4" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      className="theme-runtime-primary-button inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium transition"
                    >
                      <span>{t("runtime.modal.backToWorkspace")}</span>
                      <ArrowUpRight className="theme-directional-icon h-4 w-4" />
                    </button>
                  )}

                  <a
                    href={RUNTIME_SETUP_GUIDE_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => onOpenChange(false)}
                    className="theme-runtime-secondary-button inline-flex h-12 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition"
                  >
                    <span>{t("runtime.modal.viewGuide")}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="theme-runtime-ghost-button inline-flex h-12 items-center justify-center rounded-full border bg-transparent px-5 text-sm font-medium transition"
                  >
                    {t("runtime.modal.dismiss")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}
