import { cva, type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "theme-button-base inline-flex items-center justify-center rounded-full font-medium transition duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "theme-button-primary",
        secondary: "theme-button-secondary",
        ghost: "theme-button-ghost"
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
