import { act, render, screen, waitFor } from "@testing-library/react"
import { createElement } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  THEME_ROTATION_INTERVAL_MS,
  THEME_STORAGE_KEY
} from "./theme-palette-config"
import { ThemePaletteProvider, useThemePalette } from "./theme-palette-provider"

function ThemePaletteProbe() {
  const { activePalette, paletteMode } = useThemePalette()

  return (
    <div>
      <p data-testid="active-palette">{activePalette.id}</p>
      <p data-testid="palette-mode">{paletteMode}</p>
    </div>
  )
}

function mockMotionPreference(reduceMotion: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)" ? reduceMotion : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      removeEventListener: vi.fn(),
      removeListener: vi.fn()
    }))
  })
}

let visibilityState: DocumentVisibilityState = "visible"

function setVisibilityState(nextState: DocumentVisibilityState) {
  visibilityState = nextState

  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => visibilityState
  })
}

describe("ThemePaletteProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockMotionPreference(false)
    setVisibilityState("visible")
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("defaults new sessions to a pinned manual palette", async () => {
    render(
      createElement(
        ThemePaletteProvider,
        null,
        createElement(ThemePaletteProbe)
      )
    )

    await waitFor(() => {
      expect(screen.getByTestId("palette-mode")).toHaveTextContent("manual")
    })

    const storedPreference = JSON.parse(
      window.localStorage.getItem(THEME_STORAGE_KEY) ?? "{}"
    ) as {
      paletteMode?: string
      selectedPaletteId?: string
    }

    expect(storedPreference.paletteMode).toBe("manual")
    expect(storedPreference.selectedPaletteId).toBe("theme-ember-magma")
  })

  it("keeps auto mode visible-only and stops persisting every rotation tick", async () => {
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({
        colorMode: "light",
        paletteMode: "auto",
        selectedPaletteId: "theme-ember-magma"
      })
    )

    const setItemSpy = vi.spyOn(Storage.prototype, "setItem")

    render(
      createElement(
        ThemePaletteProvider,
        null,
        createElement(ThemePaletteProbe)
      )
    )

    await waitFor(() => {
      expect(screen.getByTestId("palette-mode")).toHaveTextContent("auto")
    })

    setItemSpy.mockClear()
    const initialPaletteId = screen.getByTestId("active-palette").textContent

    await act(async () => {
      vi.advanceTimersByTime(THEME_ROTATION_INTERVAL_MS)
    })

    expect(screen.getByTestId("active-palette").textContent).not.toBe(initialPaletteId)
    expect(setItemSpy).not.toHaveBeenCalled()

    setVisibilityState("hidden")
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"))
    })

    const hiddenPaletteId = screen.getByTestId("active-palette").textContent

    await act(async () => {
      vi.advanceTimersByTime(THEME_ROTATION_INTERVAL_MS * 2)
    })

    expect(screen.getByTestId("active-palette")).toHaveTextContent(hiddenPaletteId ?? "")
    expect(setItemSpy).not.toHaveBeenCalled()
  })
})
