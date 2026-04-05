import { z } from "zod"

type EnvironmentLike = Readonly<Record<string, string | undefined>>

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("AI Ad Studio"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
})

const serverEnvironmentSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET_NAME: z.string().min(1).optional()
})

export type WebRuntimeReadiness = {
  publicAppUrlConfigured: boolean
  r2Configured: boolean
  serviceRoleConfigured: boolean
  supabaseAuthConfigured: boolean
}

export function hasSupabaseAuthConfiguration(
  env: EnvironmentLike = process.env
) {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export function hasR2StorageConfiguration(env: EnvironmentLike = process.env) {
  return Boolean(
    env.R2_ACCOUNT_ID &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY &&
      env.R2_BUCKET_NAME
  )
}

export function getWebRuntimeReadiness(
  env: EnvironmentLike = process.env
): WebRuntimeReadiness {
  return {
    publicAppUrlConfigured: Boolean(env.NEXT_PUBLIC_APP_URL),
    r2Configured: hasR2StorageConfiguration(env),
    serviceRoleConfigured: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
    supabaseAuthConfigured: hasSupabaseAuthConfiguration(env)
  }
}

export function getWebRuntimeStatus(readiness: WebRuntimeReadiness) {
  return readiness.publicAppUrlConfigured &&
    readiness.r2Configured &&
    readiness.serviceRoleConfigured &&
    readiness.supabaseAuthConfigured
    ? "ok"
    : "degraded"
}

export function getPublicEnvironment() {
  return publicEnvironmentSchema.parse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })
}

export function getServerEnvironment() {
  return serverEnvironmentSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME
  })
}
