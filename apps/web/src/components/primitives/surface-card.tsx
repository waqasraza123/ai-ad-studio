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
        "rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
