import type { ReactNode } from "react"
import { LoadingSpinner } from "@/components/loading/loading-spinner"
import { cn } from "@/lib/utils"

type LoadingOverlayProps = {
  className?: string
  label: ReactNode
}

export function LoadingOverlay({ className, label }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex cursor-wait items-center justify-center bg-[var(--background)]/85 p-4 backdrop-blur-sm",
        className
      )}
      aria-busy
      aria-live="polite"
      role="status"
    >
      <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border-strong)] bg-[var(--background-strong)] px-5 py-3 text-sm font-medium text-[var(--foreground)] shadow-lg">
        <LoadingSpinner />
        <span>{label}</span>
      </div>
    </div>
  )
}
