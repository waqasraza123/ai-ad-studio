import { cva, type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border border-amber-300/20 bg-[linear-gradient(180deg,rgba(251,146,60,1),rgba(244,63,94,0.92))] text-white shadow-[0_18px_56px_rgba(249,115,22,0.28)] hover:shadow-[0_22px_72px_rgba(249,115,22,0.34)] hover:brightness-[1.02]",
        secondary:
          "border border-white/12 bg-white/6 text-white hover:bg-white/10",
        ghost: "text-slate-300 hover:bg-white/6 hover:text-white"
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    children: ReactNode
  }

export function Button({
  children,
  className,
  size,
  variant,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ className, size, variant }))} {...props}>
      {children}
    </button>
  )
}
