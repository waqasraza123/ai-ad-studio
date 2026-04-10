"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n/provider"

type DeliveryInvestigationViewCopyButtonProps = {
  className: string
  href: string
}

export function DeliveryInvestigationViewCopyButton({
  className,
  href
}: DeliveryInvestigationViewCopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const { t } = useI18n()

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
      {copied
        ? t("delivery.investigationView.copied")
        : t("delivery.investigationView.copy")}
    </button>
  )
}
