import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

type SurfaceCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function SurfaceCard({
  children,
  className,
  ...props
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "theme-surface-card rounded-[1.75rem] border backdrop-blur-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
