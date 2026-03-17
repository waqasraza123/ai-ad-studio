import { z } from "zod"

const workerEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(3000)
})

export type WorkerEnvironment = z.infer<typeof workerEnvironmentSchema>

export function hasWorkerEnvironmentConfiguration() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export function getWorkerEnvironment() {
  return workerEnvironmentSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    WORKER_POLL_INTERVAL_MS: process.env.WORKER_POLL_INTERVAL_MS
  })
}
