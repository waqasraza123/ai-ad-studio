"use client"

import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"
import type { ComponentProps, ReactNode } from "react"
import { Button } from "@/components/primitives/button"
import { cn } from "@/lib/utils"

type FormSubmitButtonProps = Omit<ComponentProps<typeof Button>, "type" | "children"> & {
  children: ReactNode
  /** Shown while the form action is running; defaults to children if string-only is awkward */
  pendingLabel?: ReactNode
}

export function FormSubmitButton({
  children,
  pendingLabel,
  className,
  variant,
  size,
  disabled: disabledProp,
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus()
  const disabled = Boolean(disabledProp) || pending

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={disabled}
      aria-busy={pending}
      className={cn(pending && "gap-2", className)}
      {...props}
    >
      {pending ? (
        <>
          <Loader2
            className="h-4 w-4 shrink-0 animate-spin"
            aria-hidden
          />
          <span>{pendingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </Button>
  )
}
