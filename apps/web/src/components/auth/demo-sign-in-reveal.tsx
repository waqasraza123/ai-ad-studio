"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ChevronDown, LogIn } from "lucide-react"
import { useI18n } from "@/lib/i18n/provider"

type DemoSignInRevealProps = {
  email: string
  password?: string
  subtext?: string
}

export function DemoSignInReveal({
  email,
  password,
  subtext
}: DemoSignInRevealProps) {
  const [isOpen, setIsOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const { t } = useI18n()

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="theme-focus-ring flex w-full cursor-pointer items-center justify-between rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.46)] px-4 py-3 text-sm font-medium text-[var(--soft-foreground)] transition hover:border-[var(--border-strong)] hover:bg-[rgba(255,255,255,0.62)]"
      >
        <span>{t("auth.demo.reveal")}</span>
        <motion.span
          animate={shouldReduceMotion ? { rotate: 0 } : { rotate: isOpen ? 180 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
          className="text-[var(--muted-foreground)]"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={shouldReduceMotion ? { opacity: 0, height: 0 } : { opacity: 0, y: -6, height: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
            className="overflow-hidden"
          >
            <div className="theme-soft-panel mt-3 rounded-[1.25rem] border p-4">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                {t("auth.demo.access")}
              </p>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                    {t("common.words.email")}
                  </p>
                  <p className="theme-bidi-isolate mt-1 font-mono text-sm text-[var(--foreground)]">
                    {email}
                  </p>
                </div>
                {password ? (
                  <div>
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                      {t("common.words.password")}
                    </p>
                    <p className="theme-bidi-isolate mt-1 font-mono text-sm text-[var(--foreground)]">
                      {password}
                    </p>
                  </div>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {subtext ?? t("auth.demo.prefillDescription")}
              </p>
              <Link
                href={`/login?email=${encodeURIComponent(email)}${
                  password
                    ? `&password=${encodeURIComponent(password)}`
                    : ""
                }`}
                className="theme-inline-secondary-button mt-4 inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
              >
                <LogIn className="h-4 w-4" />
                <span className="ms-2">{t("auth.demo.prefill")}</span>
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
