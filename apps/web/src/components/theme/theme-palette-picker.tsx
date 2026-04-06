"use client"

import { Orbit, PaintBucket } from "lucide-react"
import { cn } from "@/lib/utils"
import { useThemePalette } from "./theme-palette-provider"

export function ThemePalettePicker() {
  const { activePalette, mode, palettes, resumeAuto, selectPalette } = useThemePalette()

  return (
    <section className="theme-palette-panel mt-6 rounded-[1.5rem] border p-4">
      <div className="flex items-start gap-3">
        <div className="theme-icon-chip flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border">
          {mode === "auto" ? (
            <Orbit className="h-5 w-5" />
          ) : (
            <PaintBucket className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              Theme palette
            </p>
            <span className="theme-status-pill rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.24em]">
              {mode === "auto" ? "Auto cycling" : "Pinned"}
            </span>
          </div>

          <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
            {activePalette.label}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            {activePalette.description}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {palettes.map((palette) => {
          const isSelected = palette.id === activePalette.id

          return (
            <button
              key={palette.id}
              type="button"
              aria-label={`Switch site palette to ${palette.label}`}
              aria-pressed={isSelected}
              onClick={() => selectPalette(palette.id)}
              className={cn(
                "theme-swatch-button theme-focus-ring relative h-11 rounded-2xl border transition",
                isSelected ? "theme-swatch-button-active" : null
              )}
            >
              <span
                className="absolute inset-[3px] rounded-[1rem]"
                style={{
                  background: `linear-gradient(135deg, ${palette.swatch[0]}, ${palette.swatch[1]} 55%, ${palette.swatch[2]})`
                }}
              />
              <span className="sr-only">{palette.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          Changes every 2s in auto mode
        </p>

        <button
          type="button"
          onClick={resumeAuto}
          className="theme-inline-secondary-button inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium"
        >
          Resume auto
        </button>
      </div>
    </section>
  )
}
