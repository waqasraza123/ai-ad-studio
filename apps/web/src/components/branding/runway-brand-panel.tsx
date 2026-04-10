import { ExternalLink } from "lucide-react"
import { getServerI18n } from "@/lib/i18n/server"
import { cn } from "@/lib/utils"

type RunwayBrandPanelProps = {
  className?: string
  eyebrow?: string
  title?: string
  description?: string
  compact?: boolean
}

export async function RunwayBrandPanel({
  className,
  eyebrow,
  title,
  description,
  compact = false,
}: RunwayBrandPanelProps) {
  const { t } = await getServerI18n()
  const resolvedEyebrow = eyebrow ?? t("branding.runway.eyebrow")
  const resolvedTitle = title ?? t("branding.runway.title")
  const resolvedDescription =
    description ?? t("branding.runway.description")

  return (
    <a
      href="https://runwayml.com/"
      target="_blank"
      rel="noreferrer"
      className={cn(
        "theme-soft-panel theme-soft-panel-accent-hover group block rounded-[1.5rem] border p-4 transition",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="theme-icon-chip flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <img
            src="/brand/runway-icon.png"
            alt={t("branding.runway.logoAlt")}
            className="h-8 w-8 rounded-xl"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            {resolvedEyebrow}
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{resolvedTitle}</p>
          {resolvedDescription ? (
            <p
              className={cn(
                "mt-2 text-sm leading-6 text-[var(--muted-foreground)]",
                compact ? "max-w-sm" : "max-w-xl"
              )}
            >
              {resolvedDescription}
            </p>
          ) : null}
        </div>

        <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition group-hover:text-[rgb(var(--accent-rgb))]" />
      </div>

      <div className="theme-accent-pill mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
        <span>{t("branding.runway.visit")}</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </div>
    </a>
  )
}
