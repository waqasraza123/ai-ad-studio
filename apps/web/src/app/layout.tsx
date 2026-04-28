import { Inter, Noto_Kufi_Arabic } from "next/font/google"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { I18nProvider } from "@/lib/i18n/provider"
import { getServerI18n } from "@/lib/i18n/server"
import { ThemePaletteProvider } from "@/components/theme/theme-palette-provider"
import "./globals.css"

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-app-latin"
})

const notoKufiArabic = Noto_Kufi_Arabic({
  display: "swap",
  subsets: ["arabic"],
  variable: "--font-app-arabic",
  weight: ["400", "500", "600", "700"]
})

type RootLayoutProps = {
  children: ReactNode
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n()

  return {
    description: t("app.description"),
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }]
    },
    title: t("app.name")
  }
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const { direction, locale, messages } = await getServerI18n()

  return (
    <html lang={locale} dir={direction} data-locale={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoKufiArabic.variable}`}
        suppressHydrationWarning
      >
        <I18nProvider direction={direction} locale={locale} messages={messages}>
          <ThemePaletteProvider>{children}</ThemePaletteProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
