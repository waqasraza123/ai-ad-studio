"use server"

import { redirect } from "next/navigation"
import { hasSupabaseAuthConfiguration } from "@/lib/env"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function signOut() {
  if (!hasSupabaseAuthConfiguration()) {
    redirect("/login")
  }

  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}
