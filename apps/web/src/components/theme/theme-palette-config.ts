export type ThemePaletteMode = "auto" | "manual"
export type ThemeColorMode = "dark" | "light"

export type ThemePalette = {
  id: string
  label: string
  shortLabel: string
  description: string
  swatch: [string, string, string]
  darkCssVariables: Record<string, string>
  lightCssVariables: Record<string, string>
}

export const THEME_ROTATION_INTERVAL_MS = 2000
export const THEME_STORAGE_KEY = "ai-ad-studio:site-theme-palette:v2"
export const LEGACY_THEME_STORAGE_KEY = "ai-ad-studio:site-theme-palette:v1"
export const DEFAULT_THEME_ID = "theme-ember-magma"

function buildDarkCssVariables(input: {
  accentRgb: string
  accentSecondaryRgb: string
  accentTertiaryRgb: string
  background: string
  backgroundDeep: string
  foreground: string
  mutedForeground: string
  pageGlowRgb: string
  pageSecondaryGlowRgb: string
  previewGlowRgb: string
  primary: string
  primaryRgb: string
  primaryStrong: string
  primaryStrongRgb: string
  softForeground: string
  topBarBg: string
}) {
  return {
    "--background": input.background,
    "--background-deep": input.backgroundDeep,
    "--background-elevated": "rgba(255, 255, 255, 0.045)",
    "--background-soft": "rgba(255, 255, 255, 0.03)",
    "--background-strong": "rgba(255, 255, 255, 0.06)",
    "--foreground": input.foreground,
    "--muted-foreground": input.mutedForeground,
    "--soft-foreground": input.softForeground,
    "--border": "rgba(255, 255, 255, 0.1)",
    "--border-strong": "rgba(255, 255, 255, 0.18)",
    "--primary": input.primary,
    "--primary-strong": input.primaryStrong,
    "--primary-rgb": input.primaryRgb,
    "--primary-strong-rgb": input.primaryStrongRgb,
    "--accent-rgb": input.accentRgb,
    "--accent-secondary-rgb": input.accentSecondaryRgb,
    "--accent-tertiary-rgb": input.accentTertiaryRgb,
    "--page-glow-rgb": input.pageGlowRgb,
    "--page-secondary-glow-rgb": input.pageSecondaryGlowRgb,
    "--preview-glow-rgb": input.previewGlowRgb,
    "--top-bar-bg": input.topBarBg,
    "--top-bar-border": "rgb(255 255 255 / 0.08)",
    "--shadow-rgb": "4 8 24",
    "--button-primary-foreground": "#fff7ed",
    "--button-secondary-foreground": input.foreground,
    "--button-ghost-foreground": input.mutedForeground,
    "--button-ghost-hover-foreground": input.foreground
  }
}

function buildLightCssVariables(input: {
  accentRgb: string
  accentSecondaryRgb: string
  accentTertiaryRgb: string
  background: string
  backgroundDeep: string
  foreground: string
  mutedForeground: string
  pageGlowRgb: string
  pageSecondaryGlowRgb: string
  previewGlowRgb: string
  primary: string
  primaryRgb: string
  primaryStrong: string
  primaryStrongRgb: string
  softForeground: string
  topBarBg: string
}) {
  return {
    "--background": input.background,
    "--background-deep": input.backgroundDeep,
    "--background-elevated": "rgba(255, 255, 255, 0.82)",
    "--background-soft": "rgba(255, 255, 255, 0.58)",
    "--background-strong": "rgba(255, 255, 255, 0.94)",
    "--foreground": input.foreground,
    "--muted-foreground": input.mutedForeground,
    "--soft-foreground": input.softForeground,
    "--border": "rgba(15, 23, 42, 0.1)",
    "--border-strong": "rgba(15, 23, 42, 0.18)",
    "--primary": input.primary,
    "--primary-strong": input.primaryStrong,
    "--primary-rgb": input.primaryRgb,
    "--primary-strong-rgb": input.primaryStrongRgb,
    "--accent-rgb": input.accentRgb,
    "--accent-secondary-rgb": input.accentSecondaryRgb,
    "--accent-tertiary-rgb": input.accentTertiaryRgb,
    "--page-glow-rgb": input.pageGlowRgb,
    "--page-secondary-glow-rgb": input.pageSecondaryGlowRgb,
    "--preview-glow-rgb": input.previewGlowRgb,
    "--top-bar-bg": input.topBarBg,
    "--top-bar-border": "rgb(15 23 42 / 0.08)",
    "--shadow-rgb": "29 34 48",
    "--button-primary-foreground": "#fffdf8",
    "--button-secondary-foreground": input.foreground,
    "--button-ghost-foreground": input.mutedForeground,
    "--button-ghost-hover-foreground": input.foreground
  }
}

export const themePalettes: ThemePalette[] = [
  {
    id: "theme-ember-magma",
    label: "Ember Magma",
    shortLabel: "Ember",
    description: "Orange heat and pink flare over obsidian glass.",
    swatch: ["#ff7a18", "#ff3366", "#ffd166"],
    darkCssVariables: buildDarkCssVariables({
      accentRgb: "255 170 95",
      accentSecondaryRgb: "255 64 129",
      accentTertiaryRgb: "255 209 102",
      background: "#050816",
      backgroundDeep: "#130713",
      foreground: "#f8fafc",
      mutedForeground: "#9fb0c9",
      pageGlowRgb: "255 122 24",
      pageSecondaryGlowRgb: "255 64 129",
      previewGlowRgb: "255 64 129",
      primary: "#ff7a18",
      primaryRgb: "255 122 24",
      primaryStrong: "#ff3366",
      primaryStrongRgb: "255 51 102",
      softForeground: "#dbe6f7",
      topBarBg: "rgba(5, 8, 22, 0.82)"
    }),
    lightCssVariables: buildLightCssVariables({
      accentRgb: "255 122 24",
      accentSecondaryRgb: "255 51 102",
      accentTertiaryRgb: "217 119 6",
      background: "#fff7ef",
      backgroundDeep: "#ffe8d6",
      foreground: "#22151a",
      mutedForeground: "#755a58",
      pageGlowRgb: "255 148 77",
      pageSecondaryGlowRgb: "251 113 133",
      previewGlowRgb: "255 122 24",
      primary: "#ef6c2d",
      primaryRgb: "239 108 45",
      primaryStrong: "#e11d48",
      primaryStrongRgb: "225 29 72",
      softForeground: "#4b302f",
      topBarBg: "rgba(255, 247, 239, 0.78)"
    })
  },
  {
    id: "theme-electric-cyan",
    label: "Electric Cyan",
    shortLabel: "Cyan",
    description: "Neon cyan and aqua over deep midnight navy.",
    swatch: ["#06b6d4", "#22d3ee", "#67e8f9"],
    darkCssVariables: buildDarkCssVariables({
      accentRgb: "103 232 249",
      accentSecondaryRgb: "56 189 248",
      accentTertiaryRgb: "125 211 252",
      background: "#04111a",
      backgroundDeep: "#071d2f",
      foreground: "#ecfeff",
      mutedForeground: "#9eb9c6",
      pageGlowRgb: "6 182 212",
      pageSecondaryGlowRgb: "34 211 238",
      previewGlowRgb: "56 189 248",
      primary: "#06b6d4",
      primaryRgb: "6 182 212",
      primaryStrong: "#22d3ee",
      primaryStrongRgb: "34 211 238",
      softForeground: "#d3f8ff",
      topBarBg: "rgba(4, 17, 26, 0.84)"
    }),
    lightCssVariables: buildLightCssVariables({
      accentRgb: "8 145 178",
      accentSecondaryRgb: "14 165 233",
      accentTertiaryRgb: "6 182 212",
      background: "#f1fbfe",
      backgroundDeep: "#dff6fb",
      foreground: "#0f2533",
      mutedForeground: "#517283",
      pageGlowRgb: "34 211 238",
      pageSecondaryGlowRgb: "56 189 248",
      previewGlowRgb: "14 165 233",
      primary: "#0891b2",
      primaryRgb: "8 145 178",
      primaryStrong: "#0ea5e9",
      primaryStrongRgb: "14 165 233",
      softForeground: "#18394a",
      topBarBg: "rgba(241, 251, 254, 0.8)"
    })
  },
  {
    id: "theme-acid-lime",
    label: "Acid Lime",
    shortLabel: "Lime",
    description: "High-voltage chartreuse on dark carbon.",
    swatch: ["#84cc16", "#d9f99d", "#bef264"],
    darkCssVariables: buildDarkCssVariables({
      accentRgb: "217 249 157",
      accentSecondaryRgb: "190 242 100",
      accentTertiaryRgb: "132 204 22",
      background: "#081108",
      backgroundDeep: "#18230a",
      foreground: "#f7fee7",
      mutedForeground: "#b1bf95",
      pageGlowRgb: "132 204 22",
      pageSecondaryGlowRgb: "190 242 100",
      previewGlowRgb: "190 242 100",
      primary: "#84cc16",
      primaryRgb: "132 204 22",
      primaryStrong: "#a3e635",
      primaryStrongRgb: "163 230 53",
      softForeground: "#ebf9d0",
      topBarBg: "rgba(8, 17, 8, 0.84)"
    }),
    lightCssVariables: buildLightCssVariables({
      accentRgb: "101 163 13",
      accentSecondaryRgb: "132 204 22",
      accentTertiaryRgb: "77 124 15",
      background: "#f8fdea",
      backgroundDeep: "#edf7cf",
      foreground: "#18250e",
      mutedForeground: "#59684a",
      pageGlowRgb: "163 230 53",
      pageSecondaryGlowRgb: "132 204 22",
      previewGlowRgb: "132 204 22",
      primary: "#65a30d",
      primaryRgb: "101 163 13",
      primaryStrong: "#84cc16",
      primaryStrongRgb: "132 204 22",
      softForeground: "#26331b",
      topBarBg: "rgba(248, 253, 234, 0.82)"
    })
  },
  {
    id: "theme-crimson-fuchsia",
    label: "Crimson Fuchsia",
    shortLabel: "Crimson",
    description: "Hot magenta and crimson with luxe dark contrast.",
    swatch: ["#e11d48", "#ec4899", "#fb7185"],
    darkCssVariables: buildDarkCssVariables({
      accentRgb: "251 113 133",
      accentSecondaryRgb: "244 114 182",
      accentTertiaryRgb: "253 164 175",
      background: "#110612",
      backgroundDeep: "#25081d",
      foreground: "#fff1f6",
      mutedForeground: "#c6a6b3",
      pageGlowRgb: "225 29 72",
      pageSecondaryGlowRgb: "236 72 153",
      previewGlowRgb: "244 114 182",
      primary: "#e11d48",
      primaryRgb: "225 29 72",
      primaryStrong: "#ec4899",
      primaryStrongRgb: "236 72 153",
      softForeground: "#ffe0eb",
      topBarBg: "rgba(17, 6, 18, 0.84)"
    }),
    lightCssVariables: buildLightCssVariables({
      accentRgb: "225 29 72",
      accentSecondaryRgb: "236 72 153",
      accentTertiaryRgb: "190 24 93",
      background: "#fff3f7",
      backgroundDeep: "#ffe3ee",
      foreground: "#30131f",
      mutedForeground: "#7d5866",
      pageGlowRgb: "251 113 133",
      pageSecondaryGlowRgb: "244 114 182",
      previewGlowRgb: "236 72 153",
      primary: "#db2777",
      primaryRgb: "219 39 119",
      primaryStrong: "#e11d48",
      primaryStrongRgb: "225 29 72",
      softForeground: "#45202e",
      topBarBg: "rgba(255, 243, 247, 0.8)"
    })
  },
  {
    id: "theme-cobalt-violet",
    label: "Cobalt Violet",
    shortLabel: "Cobalt",
    description: "Cobalt blue punched with electric violet.",
    swatch: ["#2563eb", "#8b5cf6", "#60a5fa"],
    darkCssVariables: buildDarkCssVariables({
      accentRgb: "96 165 250",
      accentSecondaryRgb: "167 139 250",
      accentTertiaryRgb: "129 140 248",
      background: "#050816",
      backgroundDeep: "#10153a",
      foreground: "#eef2ff",
      mutedForeground: "#a9b4d6",
      pageGlowRgb: "37 99 235",
      pageSecondaryGlowRgb: "139 92 246",
      previewGlowRgb: "96 165 250",
      primary: "#2563eb",
      primaryRgb: "37 99 235",
      primaryStrong: "#8b5cf6",
      primaryStrongRgb: "139 92 246",
      softForeground: "#dfe7ff",
      topBarBg: "rgba(5, 8, 22, 0.84)"
    }),
    lightCssVariables: buildLightCssVariables({
      accentRgb: "37 99 235",
      accentSecondaryRgb: "139 92 246",
      accentTertiaryRgb: "79 70 229",
      background: "#f4f6ff",
      backgroundDeep: "#e4e9ff",
      foreground: "#171d37",
      mutedForeground: "#5d688e",
      pageGlowRgb: "96 165 250",
      pageSecondaryGlowRgb: "167 139 250",
      previewGlowRgb: "129 140 248",
      primary: "#2563eb",
      primaryRgb: "37 99 235",
      primaryStrong: "#7c3aed",
      primaryStrongRgb: "124 58 237",
      softForeground: "#232a4a",
      topBarBg: "rgba(244, 246, 255, 0.82)"
    })
  }
]

export function findThemePaletteById(id: string | null | undefined) {
  return themePalettes.find((palette) => palette.id === id) ?? themePalettes[0]!
}
