import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeEach, vi } from "vitest"
import { resetTestNavigation } from "@/test/navigation"

vi.mock("next/navigation", async () => import("@/test/navigation"))

beforeEach(() => {
  resetTestNavigation()

  if (typeof document !== "undefined") {
    document.documentElement.dir = "ltr"
    document.documentElement.lang = "en"
    document.documentElement.dataset.locale = "en"
  }

  if (typeof window !== "undefined" && !window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        removeEventListener: vi.fn(),
        removeListener: vi.fn()
      })
    })
  }
})

afterEach(() => {
  cleanup()
  if (typeof window !== "undefined") {
    window.localStorage.clear()
  }
})
