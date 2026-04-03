"use client"

import { useState } from "react"

type DeliveryInvestigationViewCopyButtonProps = {
  className: string
  href: string
}

export function DeliveryInvestigationViewCopyButton({
  className,
  href
}: DeliveryInvestigationViewCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    const absoluteHref = `${window.location.origin}${href}`

    await navigator.clipboard.writeText(absoluteHref)
    setCopied(true)

    window.setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <button className={className} onClick={handleClick} type="button">
      {copied ? "Copied link" : "Copy shareable link"}
    </button>
  )
}
