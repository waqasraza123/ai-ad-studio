"use client"

import { MoonStar, SunMedium } from "lucide-react"
import { cn } from "@/lib/utils"
import { useThemePalette } from "./theme-palette-provider"

type ThemeColorModeSwitchProps = {
  compact?: boolean
}

export function ThemeColorModeSwitch({
  compact = false
}: ThemeColorModeSwitchProps) {
  const { colorMode, setColorMode } = useThemePalette()
  const isLight = colorMode === "light"
  const nextMode = isLight ? "dark" : "light"

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextMode} mode`}
      aria-pressed={isLight}
      onClick={() => setColorMode(nextMode)}
      className={cn(
        "theme-color-mode-switch theme-focus-ring inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium",
        compact ? "h-10" : "h-11 px-4"
      )}
    >
      <span className="theme-color-mode-switch-icon inline-flex h-7 w-7 items-center justify-center rounded-full">
        {isLight ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      </span>
      <span className="theme-color-mode-switch-label">
        {isLight ? "Light mode" : "Dark mode"}
      </span>
    </button>
  )
}
