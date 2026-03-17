import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getPublicEnvironment } from "@/lib/env"

export async function createSupabaseServerClient() {
  const environment = getPublicEnvironment()
  const cookieStore = await cookies()

  return createServerClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, options, value }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            return
          }
        }
      }
    }
  )
}
