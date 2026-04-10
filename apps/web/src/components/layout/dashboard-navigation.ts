import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Bell,
  Image,
  LayoutDashboard,
  Megaphone,
  PlusSquare,
  Settings2,
  Sparkles,
  Truck,
  Video
} from "lucide-react"
import type { AppMessageKey } from "@/lib/i18n/messages/en"

export type DashboardNavigationMatch = "exact" | "prefix"

export type DashboardNavigationItem = {
  href: string
  icon: LucideIcon
  labelKey: AppMessageKey
  match?: DashboardNavigationMatch
}

export type DashboardNavigationSection = {
  items: DashboardNavigationItem[]
  labelKey: AppMessageKey
}

export const dashboardNavigationSections: DashboardNavigationSection[] = [
  {
    labelKey: "header.app.nav.workspace",
    items: [
      {
        href: "/dashboard",
        icon: LayoutDashboard,
        labelKey: "header.app.nav.dashboard",
        match: "exact"
      },
      {
        href: "/dashboard/projects/new",
        icon: PlusSquare,
        labelKey: "header.app.nav.newProject",
        match: "exact"
      }
    ]
  },
  {
    labelKey: "header.app.nav.production",
    items: [
      {
        href: "/dashboard/concepts",
        icon: Sparkles,
        labelKey: "header.app.nav.concepts",
        match: "exact"
      },
      {
        href: "/dashboard/exports",
        icon: Video,
        labelKey: "header.app.nav.exports",
        match: "prefix"
      }
    ]
  },
  {
    labelKey: "header.app.nav.operations",
    items: [
      {
        href: "/dashboard/analytics",
        icon: BarChart3,
        labelKey: "header.app.nav.analytics",
        match: "exact"
      },
      {
        href: "/dashboard/delivery",
        icon: Truck,
        labelKey: "header.app.nav.delivery",
        match: "exact"
      },
      {
        href: "/dashboard/notifications",
        icon: Bell,
        labelKey: "header.app.nav.notifications",
        match: "exact"
      }
    ]
  },
  {
    labelKey: "header.app.nav.publishing",
    items: [
      {
        href: "/dashboard/showcase",
        icon: Image,
        labelKey: "header.app.nav.showcase",
        match: "exact"
      },
      {
        href: "/dashboard/campaigns",
        icon: Megaphone,
        labelKey: "header.app.nav.campaigns",
        match: "exact"
      }
    ]
  },
  {
    labelKey: "header.app.nav.administration",
    items: [
      {
        href: "/dashboard/settings",
        icon: Settings2,
        labelKey: "header.app.nav.settings",
        match: "prefix"
      }
    ]
  }
]

export function isDashboardNavigationItemActive(
  pathname: string,
  item: DashboardNavigationItem
) {
  if ((item.match ?? "exact") === "prefix") {
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

  return pathname === item.href
}
