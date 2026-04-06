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
import { cn } from "@/lib/utils"
import type {
  RuntimeModeDefinition,
  RuntimeSetupContext
} from "./runtime-setup-content"
import {
  machineRecommendations,
  RUNTIME_SETUP_GUIDE_URL,
  runwayUpgradeSteps,
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
          label: "Enter dashboard"
        }
      : null

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
            className="relative z-[1] flex max-h-[92vh] w-full max-w-[1280px] flex-col overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,10,23,0.96),rgba(10,14,30,0.94))] shadow-[0_32px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
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
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.12),transparent_24rem),radial-gradient(circle_at_85%_10%,rgba(244,63,94,0.08),transparent_18rem)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)]" />

            <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200/75">
                  Runtime setup
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  API, GPU, and env guidance for the current supported provider paths
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
                aria-label="Close runtime setup modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="overflow-y-auto border-b border-white/10 px-5 py-5 sm:px-6 lg:border-b-0 lg:border-r lg:px-8 lg:py-7">
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
                    <Sparkles className="h-4 w-4" />
                    <span>Connect the right runtime to unlock full ad generation</span>
                  </div>

                  <h2
                    id={titleId}
                    className="mt-6 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-[2.85rem]"
                  >
                    Choose the fastest path to full previews, motion, and delivery.
                  </h2>
                  <p
                    id={descriptionId}
                    className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-[15px]"
                  >
                    AI Ad Studio can run in hosted, hybrid, or local modes. Today the
                    supported runtime paths are Runway, local HTTP inference, and mock
                    preview mode. If you are on an Intel MacBook Pro, treat hosted
                    Runway as the supported full-capability path.
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
                        className="rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.18)]"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                            <Icon className="h-5 w-5 text-amber-200" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{item.label}</p>
                            <p className="mt-1 text-sm text-slate-300">{item.summary}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </motion.div>

                <motion.div
                  className="mt-7 rounded-[1.8rem] border border-amber-300/18 bg-[linear-gradient(180deg,rgba(251,146,60,0.12),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_60px_rgba(251,146,60,0.12)]"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.24,
                    delay: shouldReduceMotion ? 0 : 0.1
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/20 bg-black/20">
                      <CheckCircle2 className="h-5 w-5 text-amber-100" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        What changes after buying Runway
                      </p>
                      <p className="mt-2 text-sm leading-6 text-amber-50/85">
                        Buying Runway changes your env setup, not the product workflow.
                        Add your key, keep previews on Runway, and decide whether scene
                        video stays hosted or moves to a supported local sidecar.
                      </p>
                    </div>
                  </div>

                  <ol className="mt-4 space-y-3">
                    {runwayUpgradeSteps.map((step, index) => (
                      <li key={step} className="flex items-start gap-3 text-sm text-slate-200">
                        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs font-semibold text-white">
                          {index + 1}
                        </span>
                        <span className="leading-6">{step}</span>
                      </li>
                    ))}
                  </ol>
                </motion.div>

                <motion.div
                  className="mt-7 rounded-[1.6rem] border border-white/10 bg-[#060913] p-4"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.24,
                    delay: shouldReduceMotion ? 0 : 0.15
                  }}
                >
                  <div className="flex items-center gap-2 text-sm text-white">
                    <TerminalSquare className="h-4 w-4 text-amber-200" />
                    <span>After editing `.env.local`, export it before starting the worker.</span>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[1.2rem] border border-white/10 bg-black/40">
                    <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                      <span className="ml-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                        shell session
                      </span>
                    </div>
                    <pre className="overflow-x-auto px-4 py-4 text-sm leading-7 text-slate-200">
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
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                        Supported runtime modes
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                        Edit `.env.local` with the mode you actually want to test.
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
                            "group relative overflow-hidden rounded-[1.6rem] border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]",
                            isSelected
                              ? "border-amber-300/30 bg-[linear-gradient(180deg,rgba(251,146,60,0.16),rgba(255,255,255,0.04))] shadow-[0_20px_48px_rgba(249,115,22,0.14)]"
                              : "border-white/10 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]",
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
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                              <Icon className="h-5 w-5 text-amber-200" />
                            </div>
                            <span
                              className={cn(
                                "rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.24em]",
                                mode.recommended
                                  ? "border-amber-300/25 bg-amber-400/10 text-amber-100"
                                  : mode.experimental
                                    ? "border-rose-300/20 bg-rose-400/10 text-rose-100"
                                    : "border-white/10 bg-white/[0.04] text-slate-400"
                              )}
                            >
                              {mode.eyebrow}
                            </span>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm font-medium text-white">{mode.label}</p>
                            <p className="mt-1 text-sm text-slate-300">{mode.summary}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                              {mode.detail}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                            <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
                              {mode.compatibility}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-100">
                              Open config
                              <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>

                <motion.div
                  className="mt-6 flex min-h-0 flex-1 flex-col rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.025))]"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.24,
                    delay: shouldReduceMotion ? 0 : 0.16
                  }}
                >
                  <div className="border-b border-white/10 px-5 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                          Edit your `.env.local`
                        </p>
                        <h4 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                          {selectedMode.label}
                        </h4>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                          {selectedMode.highlight}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => copySnippet(selectedMode.id, selectedMode.envLines)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
                      >
                        <Copy className="h-4 w-4" />
                        <span>
                          {copiedModeId === selectedMode.id ? "Copied" : "Copy env block"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid min-h-0 flex-1 gap-0 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="min-h-0 border-b border-white/10 px-5 py-5 xl:border-b-0 xl:border-r">
                      <div className="h-full overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#060913] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                            <span className="ml-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                              .env.local
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            Current support only
                          </span>
                        </div>
                        <pre className="h-full overflow-auto px-4 py-4 text-sm leading-7 text-slate-100">
                          <code>{selectedMode.envLines.join("\n")}</code>
                        </pre>
                      </div>
                    </div>

                    <div className="px-5 py-5">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                        Why this mode
                      </p>
                      <ul className="mt-4 space-y-3">
                        {selectedMode.notes.map((note) => (
                          <li key={note} className="flex items-start gap-3 text-sm text-slate-300">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                            <span className="leading-6">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.22,
                    delay: shouldReduceMotion ? 0 : 0.2
                  }}
                >
                  Additional provider adapters may be added later; today the supported
                  runtime paths are Runway, local HTTP inference, and mock preview mode.
                </motion.div>
              </div>
            </div>

            <div className="relative border-t border-white/10 bg-[rgba(7,10,23,0.88)] px-5 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="max-w-2xl text-sm text-slate-400">
                  Choose a mode, update `.env.local`, then export it into the worker shell
                  before running jobs.
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {primaryAction ? (
                    <Link
                      href={primaryAction.href}
                      onClick={() => onOpenChange(false)}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-amber-300/20 bg-[linear-gradient(180deg,rgba(251,146,60,1),rgba(244,63,94,0.92))] px-6 text-sm font-medium text-white shadow-[0_18px_56px_rgba(249,115,22,0.28)] transition hover:brightness-[1.03] hover:shadow-[0_22px_72px_rgba(249,115,22,0.34)]"
                    >
                      <span>{primaryAction.label}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-amber-300/20 bg-[linear-gradient(180deg,rgba(251,146,60,1),rgba(244,63,94,0.92))] px-6 text-sm font-medium text-white shadow-[0_18px_56px_rgba(249,115,22,0.28)] transition hover:brightness-[1.03] hover:shadow-[0_22px_72px_rgba(249,115,22,0.34)]"
                    >
                      <span>Back to workspace</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  )}

                  <a
                    href={RUNTIME_SETUP_GUIDE_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => onOpenChange(false)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-5 text-sm font-medium text-white transition hover:bg-white/[0.09]"
                  >
                    <span>View setup guide</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-transparent px-5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    Dismiss
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
