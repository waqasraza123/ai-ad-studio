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
        "rounded-[1.75rem] border border-white/10 bg-white/[0.035] shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
