"use client"

import { useFormStatus } from "react-dom"
import type { ComponentProps, ReactNode } from "react"
import { LoadingInline } from "@/components/loading/loading-inline"
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
        <LoadingInline label={pendingLabel ?? children} />
      ) : (
        children
      )}
    </Button>
  )
}
