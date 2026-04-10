import type { AppMessageKey } from "@/lib/i18n/messages/en"

export type SettingsNavigationItem = {
  href: string
  labelKey: AppMessageKey
  match?: "exact" | "prefix"
}

export const settingsNavigationItems: SettingsNavigationItem[] = [
  {
    href: "/dashboard/settings",
    labelKey: "settings.nav.overview",
    match: "exact"
  },
  {
    href: "/dashboard/settings/billing",
    labelKey: "settings.nav.billing",
    match: "prefix"
  },
  {
    href: "/dashboard/settings/guardrails",
    labelKey: "settings.nav.guardrails",
    match: "prefix"
  },
  {
    href: "/dashboard/settings/brand",
    labelKey: "settings.nav.brand",
    match: "prefix"
  }
]

export function isSettingsNavigationItemActive(
  pathname: string,
  item: SettingsNavigationItem
) {
  if ((item.match ?? "exact") === "prefix") {
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

  return pathname === item.href
}
