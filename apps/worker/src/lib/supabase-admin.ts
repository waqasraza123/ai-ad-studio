import { createClient } from "@supabase/supabase-js"
import { getWorkerEnvironment } from "@/lib/env"

export function createSupabaseAdminClient() {
  const environment = getWorkerEnvironment()

  return createClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
