import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { hasSupabaseAuthConfiguration } from "@/lib/env"
import { defaultLocale, LOCALE_COOKIE_NAME } from "@/lib/i18n/config"
import { resolveRequestLocale } from "@/lib/i18n/resolve-locale"

export async function updateSession(request: NextRequest) {
  const resolvedLocale = resolveRequestLocale({
    acceptLanguage: request.headers.get("accept-language"),
    cookieLocale: request.cookies.get(LOCALE_COOKIE_NAME)?.value ?? null
  })

  request.cookies.set(LOCALE_COOKIE_NAME, resolvedLocale)

  if (!hasSupabaseAuthConfiguration()) {
    const response = NextResponse.next({
      request
    })

    response.cookies.set(LOCALE_COOKIE_NAME, resolvedLocale ?? defaultLocale, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax"
    })

    return response
  }

  let response = NextResponse.next({
    request
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({
            request
          })

          cookiesToSet.forEach(({ name, options, value }) => {
            response.cookies.set(name, value, options)
          })
        }
      }
    }
  )

  await supabase.auth.getUser()

  response.cookies.set(LOCALE_COOKIE_NAME, resolvedLocale ?? defaultLocale, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax"
  })

  return response
}
