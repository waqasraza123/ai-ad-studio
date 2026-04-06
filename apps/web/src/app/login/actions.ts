"use server"

import { redirect } from "next/navigation"
import { hasSupabaseAuthConfiguration } from "@/lib/env"
import { MODEST_WORDING_FORM_ERROR_CODE, validateRecordTextFields } from "@/lib/modest-wording"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function toLoginRedirect(searchParams: Record<string, string>) {
  const query = new URLSearchParams(searchParams)
  return `/login?${query.toString()}`
}

function readCredential(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

export async function signInWithPassword(formData: FormData) {
  if (!hasSupabaseAuthConfiguration()) {
    redirect(
      toLoginRedirect({
        error: "Auth is not configured yet."
      })
    )
  }

  const email = readCredential(formData, "email")
  const password = readCredential(formData, "password")

  if (validateRecordTextFields({ email, password })) {
    redirect(
      toLoginRedirect({
        error: MODEST_WORDING_FORM_ERROR_CODE
      })
    )
  }

  if (!email || !password) {
    redirect(
      toLoginRedirect({
        error: "Email and password are required."
      })
    )
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    redirect(
      toLoginRedirect({
        error: "Unable to sign in with those credentials."
      })
    )
  }

  redirect("/dashboard")
}

export async function signUpWithPassword(formData: FormData) {
  if (!hasSupabaseAuthConfiguration()) {
    redirect(
      toLoginRedirect({
        error: "Auth is not configured yet."
      })
    )
  }

  const email = readCredential(formData, "email")
  const password = readCredential(formData, "password")

  if (validateRecordTextFields({ email, password })) {
    redirect(
      toLoginRedirect({
        error: MODEST_WORDING_FORM_ERROR_CODE
      })
    )
  }

  if (!email || !password) {
    redirect(
      toLoginRedirect({
        error: "Email and password are required."
      })
    )
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    redirect(
      toLoginRedirect({
        error: "Unable to create account right now."
      })
    )
  }

  if (data.session) {
    redirect("/dashboard")
  }

  redirect(
    toLoginRedirect({
      message: "Account created. Check your email if confirmation is enabled."
    })
  )
}
