import { cva, type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[linear-gradient(180deg,rgba(129,140,248,1),rgba(99,102,241,0.92))] text-white shadow-[0_16px_48px_rgba(79,70,229,0.35)] hover:scale-[1.01]",
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
