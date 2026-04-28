"use client"

import { useState } from "react"
import { LoadingSpinner } from "@/components/loading/loading-spinner"
import { useI18n } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

type ExportMediaFrameProps = {
  projectName: string
  previewDataUrl: string | null
  videoSrc: string | null
}

export function ExportMediaFrame({
  projectName,
  previewDataUrl,
  videoSrc
}: ExportMediaFrameProps) {
  const { t } = useI18n()
  const [phase, setPhase] = useState<"loading" | "ready" | "error">(
    videoSrc ? "loading" : "ready"
  )

  if (!videoSrc && !previewDataUrl) {
    return (
      <div className="grid aspect-video place-items-center text-sm text-slate-400">
        {t("media.exportFrame.unavailable")}
      </div>
    )
  }

  if (!videoSrc && previewDataUrl) {
    return (
      <img
        alt={t("media.exportFrame.previewAlt", { project: projectName })}
        className="aspect-video w-full object-cover"
        decoding="async"
        loading="lazy"
        src={previewDataUrl}
      />
    )
  }

  return (
    <div className="relative aspect-video w-full bg-slate-950">
      {phase === "loading" ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950/80">
          <LoadingSpinner
            className="text-amber-200/85"
            label={t("media.exportFrame.loading")}
            size="lg"
          />
        </div>
      ) : null}

      {phase === "error" ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950/90 px-6 text-center text-sm text-rose-100">
          {t("media.exportFrame.error")}
        </div>
      ) : null}

      <video
        className={cn("aspect-video w-full", phase === "error" && "hidden")}
        controls
        playsInline
        preload="none"
        src={videoSrc ?? undefined}
        onLoadedData={() => setPhase("ready")}
        onError={() => setPhase("error")}
      />
    </div>
  )
}
