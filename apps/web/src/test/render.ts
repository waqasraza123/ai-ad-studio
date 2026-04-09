import { createElement, type ReactElement, type ReactNode } from "react"
import {
  render,
  type RenderOptions,
  type RenderResult
} from "@testing-library/react"
import { ThemePaletteProvider } from "@/components/theme/theme-palette-provider"
import { I18nProvider } from "@/lib/i18n/provider"
import type { AppLocale } from "@/lib/i18n/config"
import { THEME_STORAGE_KEY } from "@/components/theme/theme-palette-config"
import { getI18nFixture } from "@/test/fixtures/i18n"
import { setTestNavigation } from "@/test/navigation"

type ExtendedRenderOptions = Omit<RenderOptions, "wrapper"> & {
  locale?: AppLocale
  pathname?: string
  searchParams?:
    | string
    | URLSearchParams
    | Record<string, string | number | boolean | null | undefined>
}

export function renderWithAppProviders(
  ui: ReactElement,
  options?: ExtendedRenderOptions
): RenderResult {
  const locale = options?.locale ?? "en"
  const i18n = getI18nFixture(locale)

  setTestNavigation({
    pathname: options?.pathname,
    searchParams: options?.searchParams
  })

  document.documentElement.dir = i18n.direction
  document.documentElement.lang = locale
  document.documentElement.dataset.locale = locale

  window.localStorage.setItem(
    THEME_STORAGE_KEY,
    JSON.stringify({
      colorMode: "light",
      paletteMode: "manual",
      selectedPaletteId: "theme-ember-magma"
    })
  )

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      I18nProvider,
      {
        direction: i18n.direction,
        children: createElement(ThemePaletteProvider, null, children),
        locale: i18n.locale,
        messages: i18n.messages
      }
    )
  }

  return render(ui, {
    wrapper: Wrapper,
    ...options
  })
}
