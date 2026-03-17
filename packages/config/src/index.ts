import { z } from "zod"

export const runtimeEnvironmentSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive()
})

export type RuntimeEnvironment = z.infer<typeof runtimeEnvironmentSchema>

export function parseRuntimeEnvironment(input: Record<string, unknown>) {
  return runtimeEnvironmentSchema.parse(input)
}
