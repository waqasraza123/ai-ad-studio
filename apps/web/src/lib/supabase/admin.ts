import { createClient } from "@supabase/supabase-js"
import { getPublicEnvironment, getServerEnvironment } from "@/lib/env"

export function createSupabaseAdminClient() {
  const publicEnvironment = getPublicEnvironment()
  const serverEnvironment = getServerEnvironment()

  if (!serverEnvironment.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin server flows")
  }

  return createClient(
    publicEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    serverEnvironment.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
