import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type LoadingSpinnerSize = "sm" | "md" | "lg"

type LoadingSpinnerProps = {
  className?: string
  label?: string
  size?: LoadingSpinnerSize
}

const spinnerSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-9 w-9"
}

export function LoadingSpinner({
  className,
  label,
  size = "sm"
}: LoadingSpinnerProps) {
  return (
    <Loader2
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={cn(spinnerSizes[size], "shrink-0 animate-spin", className)}
    />
  )
}
