import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

type AppPageFrameVariant = "expanded" | "fluid" | "readable"
type PublicFrameVariant = "readable" | "wide"

type FrameProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

type AppPageFrameProps = FrameProps & {
  variant?: AppPageFrameVariant
}

type PublicFrameProps = FrameProps & {
  variant?: PublicFrameVariant
}

type PageIntroProps = HTMLAttributes<HTMLDivElement> & {
  actions?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  title: ReactNode
}

export function AppPageFrame({
  children,
  className,
  variant = "fluid",
  ...props
}: AppPageFrameProps) {
  return (
    <div
      className={cn(
        "theme-app-page-frame",
        variant === "expanded" && "theme-app-page-frame-expanded",
        variant === "readable" && "theme-app-page-frame-readable",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function PublicPageFrame({
  children,
  className,
  variant = "wide",
  ...props
}: PublicFrameProps) {
  return (
    <div
      className={cn(
        "theme-public-page-frame",
        variant === "readable" && "theme-public-page-frame-readable",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function PublicSectionFrame({
  children,
  className,
  variant = "wide",
  ...props
}: PublicFrameProps) {
  return (
    <div
      className={cn(
        "theme-public-section-frame",
        variant === "readable" && "theme-public-section-frame-readable",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function PageIntro({
  actions,
  className,
  description,
  eyebrow,
  title,
  ...props
}: PageIntroProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between",
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">{title}</h1>
        {description ? (
          <p className="theme-page-intro-copy mt-3 text-sm leading-7 text-slate-400">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}
