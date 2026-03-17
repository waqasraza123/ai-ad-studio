import type { HTMLAttributes, ReactNode } from "react"

type SurfaceCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function SurfaceCard({ children, ...props }: SurfaceCardProps) {
  return <div {...props}>{children}</div>
}
