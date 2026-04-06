"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react"
import {
  DEFAULT_THEME_ID,
  findThemePaletteById,
  THEME_ROTATION_INTERVAL_MS,
  THEME_STORAGE_KEY,
  themePalettes,
  type ThemeMode,
  type ThemePalette
} from "./theme-palette-config"

type ThemePalettePreference = {
  mode: ThemeMode
  selectedPaletteId: string
}

type ThemePaletteContextValue = {
  mode: ThemeMode
  activePalette: ThemePalette
  palettes: ThemePalette[]
  selectPalette: (paletteId: string) => void
  resumeAuto: () => void
}

const ThemePaletteContext = createContext<ThemePaletteContextValue | null>(null)

function readStoredPreference() {
  try {
    const rawValue = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as Partial<ThemePalettePreference>
    if (
      (parsed.mode !== "auto" && parsed.mode !== "manual") ||
      typeof parsed.selectedPaletteId !== "string"
    ) {
      return null
    }

    return {
      mode: parsed.mode,
      selectedPaletteId: findThemePaletteById(parsed.selectedPaletteId).id
    } satisfies ThemePalettePreference
  } catch (error) {
    console.error("ThemePaletteProvider failed to read stored preference", error)
    return null
  }
}

function persistPreference(preference: ThemePalettePreference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference))
  } catch (error) {
    console.error("ThemePaletteProvider failed to persist preference", error)
  }
}

function clearStoredPreference() {
  try {
    window.localStorage.removeItem(THEME_STORAGE_KEY)
  } catch (error) {
    console.error("ThemePaletteProvider failed to clear stored preference", error)
  }
}

function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function ThemePaletteProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [mode, setMode] = useState<ThemeMode>("auto")
  const [manualPaletteId, setManualPaletteId] = useState(DEFAULT_THEME_ID)
  const [autoIndex, setAutoIndex] = useState(0)

  useEffect(() => {
    setHydrated(true)
    setReduceMotion(prefersReducedMotion())
  }, [])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    const storedPreference = readStoredPreference()
    if (!storedPreference) {
      setMode(prefersReducedMotion() ? "manual" : "auto")
      setManualPaletteId(DEFAULT_THEME_ID)
      setAutoIndex(0)
      return
    }

    if (storedPreference.mode === "manual") {
      setMode("manual")
      setManualPaletteId(storedPreference.selectedPaletteId)
      setAutoIndex(themePalettes.findIndex((p) => p.id === storedPreference.selectedPaletteId))
      return
    }

    if (prefersReducedMotion()) {
      setMode("manual")
      setManualPaletteId(DEFAULT_THEME_ID)
      setAutoIndex(0)
      return
    }

    setMode("auto")
    setManualPaletteId(storedPreference.selectedPaletteId)
    setAutoIndex(themePalettes.findIndex((p) => p.id === storedPreference.selectedPaletteId))
  }, [hydrated])

  const safeAutoIndex = autoIndex >= 0 ? autoIndex : 0
  const activePalette =
    mode === "manual"
      ? findThemePaletteById(manualPaletteId)
      : themePalettes[safeAutoIndex % themePalettes.length]!

  useEffect(() => {
    if (!hydrated) {
      return
    }

    const root = document.documentElement
    root.dataset.theme = activePalette.id
    root.dataset.themeMode = mode

    Object.entries(activePalette.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [activePalette, hydrated, mode])

  useEffect(() => {
    if (!hydrated || reduceMotion || mode !== "auto") {
      return
    }

    const interval = window.setInterval(() => {
      setAutoIndex((currentIndex) => (currentIndex + 1) % themePalettes.length)
    }, THEME_ROTATION_INTERVAL_MS)

    return () => {
      window.clearInterval(interval)
    }
  }, [hydrated, mode, reduceMotion])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    if (mode === "manual") {
      persistPreference({
        mode: "manual",
        selectedPaletteId: activePalette.id
      })
      return
    }

    clearStoredPreference()
  }, [activePalette.id, hydrated, mode])

  const value = useMemo<ThemePaletteContextValue>(
    () => ({
      mode,
      activePalette,
      palettes: themePalettes,
      selectPalette: (paletteId: string) => {
        const nextPalette = findThemePaletteById(paletteId)
        setMode("manual")
        setManualPaletteId(nextPalette.id)
        setAutoIndex(themePalettes.findIndex((palette) => palette.id === nextPalette.id))
      },
      resumeAuto: () => {
        const currentIndex = themePalettes.findIndex(
          (palette) => palette.id === activePalette.id
        )

        if (reduceMotion) {
          setMode("manual")
          setManualPaletteId(activePalette.id)
          return
        }

        setAutoIndex(currentIndex >= 0 ? currentIndex : 0)
        setMode("auto")
      }
    }),
    [activePalette, mode, reduceMotion]
  )

  return (
    <ThemePaletteContext.Provider value={value}>
      {children}
    </ThemePaletteContext.Provider>
  )
}

export function useThemePalette() {
  const context = useContext(ThemePaletteContext)

  if (!context) {
    throw new Error("useThemePalette must be used within ThemePaletteProvider.")
  }

  return context
}
