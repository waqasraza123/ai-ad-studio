"use client"

import { Loader2 } from "lucide-react"
import { useState } from "react"
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
  const [phase, setPhase] = useState<"loading" | "ready" | "error">(
    videoSrc ? "loading" : "ready"
  )

  if (!videoSrc && !previewDataUrl) {
    return (
      <div className="grid aspect-video place-items-center text-sm text-slate-400">
        Export preview not available yet
      </div>
    )
  }

  if (!videoSrc && previewDataUrl) {
    return (
      <img
        alt={`${projectName} export preview`}
        className="aspect-video w-full object-cover"
        src={previewDataUrl}
      />
    )
  }

  return (
    <div className="relative aspect-video w-full bg-slate-950">
      {phase === "loading" ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950/80">
          <Loader2
            className="h-9 w-9 animate-spin text-amber-200/85"
            aria-label="Loading video"
          />
        </div>
      ) : null}

      {phase === "error" ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950/90 px-6 text-center text-sm text-rose-100">
          Could not load the video preview. Use the download action if available.
        </div>
      ) : null}

      <video
        className={cn("aspect-video w-full", phase === "error" && "hidden")}
        controls
        playsInline
        preload="metadata"
        src={videoSrc ?? undefined}
        onLoadedData={() => setPhase("ready")}
        onError={() => setPhase("error")}
      />
    </div>
  )
}
