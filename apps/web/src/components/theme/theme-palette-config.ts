export type ThemeMode = "auto" | "manual"

export type ThemePalette = {
  id: string
  label: string
  shortLabel: string
  description: string
  swatch: [string, string, string]
  cssVariables: Record<string, string>
}

export const THEME_ROTATION_INTERVAL_MS = 2000
export const THEME_STORAGE_KEY = "ai-ad-studio:site-theme-palette:v1"
export const DEFAULT_THEME_ID = "theme-ember-magma"

export const themePalettes: ThemePalette[] = [
  {
    id: "theme-ember-magma",
    label: "Ember Magma",
    shortLabel: "Ember",
    description: "Orange heat and pink flare over obsidian glass.",
    swatch: ["#ff7a18", "#ff3366", "#ffd166"],
    cssVariables: {
      "--background": "#050816",
      "--background-deep": "#130713",
      "--background-elevated": "rgba(255, 255, 255, 0.045)",
      "--background-soft": "rgba(255, 255, 255, 0.03)",
      "--background-strong": "rgba(255, 255, 255, 0.06)",
      "--foreground": "#f8fafc",
      "--muted-foreground": "#9fb0c9",
      "--soft-foreground": "#dbe6f7",
      "--border": "rgba(255, 255, 255, 0.1)",
      "--border-strong": "rgba(255, 255, 255, 0.18)",
      "--primary": "#ff7a18",
      "--primary-strong": "#ff3366",
      "--primary-rgb": "255 122 24",
      "--primary-strong-rgb": "255 51 102",
      "--accent-rgb": "255 170 95",
      "--accent-secondary-rgb": "255 64 129",
      "--accent-tertiary-rgb": "255 209 102",
      "--page-glow-rgb": "255 122 24",
      "--page-secondary-glow-rgb": "255 64 129",
      "--preview-glow-rgb": "255 64 129",
      "--top-bar-bg": "rgba(5, 8, 22, 0.82)"
    }
  },
  {
    id: "theme-electric-cyan",
    label: "Electric Cyan",
    shortLabel: "Cyan",
    description: "Neon cyan and aqua over deep midnight navy.",
    swatch: ["#06b6d4", "#22d3ee", "#67e8f9"],
    cssVariables: {
      "--background": "#04111a",
      "--background-deep": "#071d2f",
      "--background-elevated": "rgba(255, 255, 255, 0.045)",
      "--background-soft": "rgba(255, 255, 255, 0.028)",
      "--background-strong": "rgba(255, 255, 255, 0.058)",
      "--foreground": "#ecfeff",
      "--muted-foreground": "#9eb9c6",
      "--soft-foreground": "#d3f8ff",
      "--border": "rgba(255, 255, 255, 0.1)",
      "--border-strong": "rgba(255, 255, 255, 0.18)",
      "--primary": "#06b6d4",
      "--primary-strong": "#22d3ee",
      "--primary-rgb": "6 182 212",
      "--primary-strong-rgb": "34 211 238",
      "--accent-rgb": "103 232 249",
      "--accent-secondary-rgb": "56 189 248",
      "--accent-tertiary-rgb": "125 211 252",
      "--page-glow-rgb": "6 182 212",
      "--page-secondary-glow-rgb": "34 211 238",
      "--preview-glow-rgb": "56 189 248",
      "--top-bar-bg": "rgba(4, 17, 26, 0.84)"
    }
  },
  {
    id: "theme-acid-lime",
    label: "Acid Lime",
    shortLabel: "Lime",
    description: "High-voltage chartreuse on dark carbon.",
    swatch: ["#84cc16", "#d9f99d", "#bef264"],
    cssVariables: {
      "--background": "#081108",
      "--background-deep": "#18230a",
      "--background-elevated": "rgba(255, 255, 255, 0.042)",
      "--background-soft": "rgba(255, 255, 255, 0.028)",
      "--background-strong": "rgba(255, 255, 255, 0.06)",
      "--foreground": "#f7fee7",
      "--muted-foreground": "#b1bf95",
      "--soft-foreground": "#ebf9d0",
      "--border": "rgba(255, 255, 255, 0.1)",
      "--border-strong": "rgba(255, 255, 255, 0.18)",
      "--primary": "#84cc16",
      "--primary-strong": "#a3e635",
      "--primary-rgb": "132 204 22",
      "--primary-strong-rgb": "163 230 53",
      "--accent-rgb": "217 249 157",
      "--accent-secondary-rgb": "190 242 100",
      "--accent-tertiary-rgb": "132 204 22",
      "--page-glow-rgb": "132 204 22",
      "--page-secondary-glow-rgb": "190 242 100",
      "--preview-glow-rgb": "190 242 100",
      "--top-bar-bg": "rgba(8, 17, 8, 0.84)"
    }
  },
  {
    id: "theme-crimson-fuchsia",
    label: "Crimson Fuchsia",
    shortLabel: "Crimson",
    description: "Hot magenta and crimson with luxe dark contrast.",
    swatch: ["#e11d48", "#ec4899", "#fb7185"],
    cssVariables: {
      "--background": "#110612",
      "--background-deep": "#25081d",
      "--background-elevated": "rgba(255, 255, 255, 0.044)",
      "--background-soft": "rgba(255, 255, 255, 0.03)",
      "--background-strong": "rgba(255, 255, 255, 0.062)",
      "--foreground": "#fff1f6",
      "--muted-foreground": "#c6a6b3",
      "--soft-foreground": "#ffe0eb",
      "--border": "rgba(255, 255, 255, 0.1)",
      "--border-strong": "rgba(255, 255, 255, 0.18)",
      "--primary": "#e11d48",
      "--primary-strong": "#ec4899",
      "--primary-rgb": "225 29 72",
      "--primary-strong-rgb": "236 72 153",
      "--accent-rgb": "251 113 133",
      "--accent-secondary-rgb": "244 114 182",
      "--accent-tertiary-rgb": "253 164 175",
      "--page-glow-rgb": "225 29 72",
      "--page-secondary-glow-rgb": "236 72 153",
      "--preview-glow-rgb": "244 114 182",
      "--top-bar-bg": "rgba(17, 6, 18, 0.84)"
    }
  },
  {
    id: "theme-cobalt-violet",
    label: "Cobalt Violet",
    shortLabel: "Cobalt",
    description: "Cobalt blue punched with electric violet.",
    swatch: ["#2563eb", "#8b5cf6", "#60a5fa"],
    cssVariables: {
      "--background": "#050816",
      "--background-deep": "#10153a",
      "--background-elevated": "rgba(255, 255, 255, 0.045)",
      "--background-soft": "rgba(255, 255, 255, 0.03)",
      "--background-strong": "rgba(255, 255, 255, 0.06)",
      "--foreground": "#eef2ff",
      "--muted-foreground": "#a9b4d6",
      "--soft-foreground": "#dfe7ff",
      "--border": "rgba(255, 255, 255, 0.1)",
      "--border-strong": "rgba(255, 255, 255, 0.18)",
      "--primary": "#2563eb",
      "--primary-strong": "#8b5cf6",
      "--primary-rgb": "37 99 235",
      "--primary-strong-rgb": "139 92 246",
      "--accent-rgb": "96 165 250",
      "--accent-secondary-rgb": "167 139 250",
      "--accent-tertiary-rgb": "129 140 248",
      "--page-glow-rgb": "37 99 235",
      "--page-secondary-glow-rgb": "139 92 246",
      "--preview-glow-rgb": "96 165 250",
      "--top-bar-bg": "rgba(5, 8, 22, 0.84)"
    }
  }
]

export function findThemePaletteById(id: string | null | undefined) {
  return themePalettes.find((palette) => palette.id === id) ?? themePalettes[0]!
}
