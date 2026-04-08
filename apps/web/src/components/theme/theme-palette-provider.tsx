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
  LEGACY_THEME_STORAGE_KEY,
  THEME_ROTATION_INTERVAL_MS,
  THEME_STORAGE_KEY,
  type ThemeColorMode,
  type ThemePalette,
  type ThemePaletteMode,
  themePalettes
} from "./theme-palette-config"

type ThemePalettePreference = {
  paletteMode: ThemePaletteMode
  selectedPaletteId: string
  colorMode: ThemeColorMode
}

type ThemePaletteContextValue = {
  paletteMode: ThemePaletteMode
  colorMode: ThemeColorMode
  activePalette: ThemePalette
  palettes: ThemePalette[]
  selectPalette: (paletteId: string) => void
  resumeAuto: () => void
  setColorMode: (mode: ThemeColorMode) => void
}

const ThemePaletteContext = createContext<ThemePaletteContextValue | null>(null)

function readStoredPreference() {
  function normalizeStoredPreference(rawValue: string | null) {
    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as Partial<ThemePalettePreference> & {
      mode?: ThemePaletteMode
    }

    const paletteMode =
      parsed.paletteMode === "auto" || parsed.paletteMode === "manual"
        ? parsed.paletteMode
        : parsed.mode === "auto" || parsed.mode === "manual"
          ? parsed.mode
          : null

    if (!paletteMode || typeof parsed.selectedPaletteId !== "string") {
      return null
    }

    return {
      colorMode: parsed.colorMode === "light" ? "light" : "dark",
      paletteMode,
      selectedPaletteId: findThemePaletteById(parsed.selectedPaletteId).id
    } satisfies ThemePalettePreference
  }

  try {
    const storedPreference = normalizeStoredPreference(
      window.localStorage.getItem(THEME_STORAGE_KEY)
    )

    if (storedPreference) {
      return storedPreference
    }

    return normalizeStoredPreference(
      window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY)
    )
  } catch (error) {
    console.error(
      "ThemePaletteProvider failed to read stored preference",
      error
    )
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

function prefersReducedMotion() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function ThemePaletteProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [paletteMode, setPaletteMode] = useState<ThemePaletteMode>("auto")
  const [colorMode, setColorMode] = useState<ThemeColorMode>("light")
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
      setPaletteMode(prefersReducedMotion() ? "manual" : "auto")
      setColorMode("light")
      setManualPaletteId(DEFAULT_THEME_ID)
      setAutoIndex(0)
      return
    }

    setColorMode(storedPreference.colorMode)

    if (storedPreference.paletteMode === "manual") {
      setPaletteMode("manual")
      setManualPaletteId(storedPreference.selectedPaletteId)
      setAutoIndex(
        themePalettes.findIndex(
          (p) => p.id === storedPreference.selectedPaletteId
        )
      )
      return
    }

    if (prefersReducedMotion()) {
      setPaletteMode("manual")
      setManualPaletteId(DEFAULT_THEME_ID)
      setAutoIndex(0)
      return
    }

    setPaletteMode("auto")
    setManualPaletteId(storedPreference.selectedPaletteId)
    setAutoIndex(
      themePalettes.findIndex(
        (p) => p.id === storedPreference.selectedPaletteId
      )
    )
  }, [hydrated])

  const safeAutoIndex = autoIndex >= 0 ? autoIndex : 0
  const activePalette =
    paletteMode === "manual"
      ? findThemePaletteById(manualPaletteId)
      : themePalettes[safeAutoIndex % themePalettes.length]!
  const activeCssVariables =
    colorMode === "light"
      ? activePalette.lightCssVariables
      : activePalette.darkCssVariables

  useEffect(() => {
    if (!hydrated) {
      return
    }

    const root = document.documentElement
    root.dataset.theme = activePalette.id
    root.dataset.themeMode = paletteMode
    root.dataset.colorMode = colorMode
    root.style.colorScheme = colorMode

    Object.entries(activeCssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [activeCssVariables, activePalette.id, colorMode, hydrated, paletteMode])

  useEffect(() => {
    if (!hydrated || reduceMotion || paletteMode !== "auto") {
      return
    }

    const interval = window.setInterval(() => {
      setAutoIndex((currentIndex) => (currentIndex + 1) % themePalettes.length)
    }, THEME_ROTATION_INTERVAL_MS)

    return () => {
      window.clearInterval(interval)
    }
  }, [hydrated, paletteMode, reduceMotion])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    persistPreference({
      colorMode,
      paletteMode,
      selectedPaletteId: activePalette.id
    })
  }, [activePalette.id, colorMode, hydrated, paletteMode])

  const value = useMemo<ThemePaletteContextValue>(
    () => ({
      paletteMode,
      colorMode,
      activePalette,
      palettes: themePalettes,
      selectPalette: (paletteId: string) => {
        const nextPalette = findThemePaletteById(paletteId)
        setPaletteMode("manual")
        setManualPaletteId(nextPalette.id)
        setAutoIndex(
          themePalettes.findIndex((palette) => palette.id === nextPalette.id)
        )
      },
      resumeAuto: () => {
        const currentIndex = themePalettes.findIndex(
          (palette) => palette.id === activePalette.id
        )

        if (reduceMotion) {
          setPaletteMode("manual")
          setManualPaletteId(activePalette.id)
          return
        }

        setAutoIndex(currentIndex >= 0 ? currentIndex : 0)
        setPaletteMode("auto")
      },
      setColorMode
    }),
    [activePalette, colorMode, paletteMode, reduceMotion]
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
