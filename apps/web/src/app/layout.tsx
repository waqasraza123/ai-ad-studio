import type { Metadata } from "next"
import type { ReactNode } from "react"
import { ThemePaletteProvider } from "@/components/theme/theme-palette-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI Ad Studio",
  description: "Premium AI product ad generation workflow"
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning>
        <ThemePaletteProvider>{children}</ThemePaletteProvider>
      </body>
    </html>
  )
}
