"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { defaultLocale, isSupportedLocale, LOCALE_COOKIE_NAME } from "@/lib/i18n/config"

function normalizeReturnTo(value: FormDataEntryValue | null) {
  const path = typeof value === "string" && value.startsWith("/") ? value : "/"
  return path
}

export async function changeLocaleAction(formData: FormData) {
  const nextLocaleValue = String(formData.get("locale") ?? "").trim()
  const returnTo = normalizeReturnTo(formData.get("returnTo"))
  const cookieStore = await cookies()
  const locale = isSupportedLocale(nextLocaleValue) ? nextLocaleValue : defaultLocale

  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax"
  })

  redirect(returnTo)
}

