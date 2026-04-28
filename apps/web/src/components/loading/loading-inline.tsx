import type { ReactNode } from "react"
import {
  LoadingSpinner,
  type LoadingSpinnerSize
} from "@/components/loading/loading-spinner"
import { cn } from "@/lib/utils"

type LoadingInlineProps = {
  className?: string
  label: ReactNode
  spinnerClassName?: string
  spinnerLabel?: string
  spinnerSize?: LoadingSpinnerSize
}

export function LoadingInline({
  className,
  label,
  spinnerClassName,
  spinnerLabel,
  spinnerSize = "sm"
}: LoadingInlineProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LoadingSpinner
        className={spinnerClassName}
        label={spinnerLabel}
        size={spinnerSize}
      />
      <span>{label}</span>
    </span>
  )
}
