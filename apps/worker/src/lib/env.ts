import { z } from "zod"

const previewProviderSchema = z.enum(["runway", "local_http", "mock"])
const sceneVideoProviderSchema = z.enum(["runway", "local_http"])
const localImageModelSchema = z.enum(["flux-schnell", "sdxl-turbo"])
const localVideoModelSchema = z.enum([
  "cogvideox1.5-5b-i2v",
  "wan2.1-i2v-14b-480p",
  "svd-img2vid"
])
const localDeviceSchema = z.enum(["cuda", "cpu"])
const localDtypeSchema = z.enum(["bf16", "fp16", "fp32"])

function parseBooleanEnvValue(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()

    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true
    }

    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false
    }
  }

  return fallback
}

const workerEnvironmentSchema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(3000),
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET_NAME: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    OPENAI_CONCEPT_MODEL: z.string().min(1).default("gpt-4o-mini"),
    OPENAI_TTS_MODEL: z.string().min(1).default("gpt-4o-mini-tts"),
    OPENAI_TTS_VOICE: z.string().min(1).default("alloy"),
    PREVIEW_PROVIDER: previewProviderSchema.default("runway"),
    SCENE_VIDEO_PROVIDER: sceneVideoProviderSchema.default("runway"),
    RUNWAYML_API_SECRET: z.string().min(1).optional(),
    RUNWAY_IMAGE_MODEL: z.string().min(1).default("gen4_image_turbo"),
    RUNWAY_VIDEO_MODEL: z.string().min(1).default("gen4_turbo"),
    LOCAL_INFERENCE_BASE_URL: z.string().url().optional(),
    LOCAL_IMAGE_MODEL: localImageModelSchema.default("flux-schnell"),
    LOCAL_VIDEO_MODEL: localVideoModelSchema.default("cogvideox1.5-5b-i2v"),
    LOCAL_DEVICE: localDeviceSchema.default("cuda"),
    LOCAL_DTYPE: localDtypeSchema.default("bf16"),
    LOCAL_ENABLE_CPU_OFFLOAD: z.preprocess(
      (value) => parseBooleanEnvValue(value, false),
      z.boolean().default(false)
    ),
    LOCAL_INFERENCE_TIMEOUT_MS: z.coerce.number().int().positive().default(900000)
  })
  .superRefine((value, context) => {
    const requiresRunway =
      value.PREVIEW_PROVIDER === "runway" || value.SCENE_VIDEO_PROVIDER === "runway"
    const requiresLocalHttp =
      value.PREVIEW_PROVIDER === "local_http" ||
      value.SCENE_VIDEO_PROVIDER === "local_http"

    if (requiresRunway && !value.RUNWAYML_API_SECRET) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "RUNWAYML_API_SECRET is required when PREVIEW_PROVIDER or SCENE_VIDEO_PROVIDER uses runway.",
        path: ["RUNWAYML_API_SECRET"]
      })
    }

    if (requiresLocalHttp && !value.LOCAL_INFERENCE_BASE_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "LOCAL_INFERENCE_BASE_URL is required when PREVIEW_PROVIDER or SCENE_VIDEO_PROVIDER uses local_http.",
        path: ["LOCAL_INFERENCE_BASE_URL"]
      })
    }
  })

export type WorkerEnvironment = z.infer<typeof workerEnvironmentSchema>
export type PreviewProviderKind = z.infer<typeof previewProviderSchema>
export type SceneVideoProviderKind = z.infer<typeof sceneVideoProviderSchema>
export type LocalImageModel = z.infer<typeof localImageModelSchema>
export type LocalVideoModel = z.infer<typeof localVideoModelSchema>
export type LocalDevice = z.infer<typeof localDeviceSchema>
export type LocalDtype = z.infer<typeof localDtypeSchema>

function buildWorkerEnvironmentInput(
  source: NodeJS.ProcessEnv | Record<string, string | undefined>
) {
  return {
    NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: source.SUPABASE_SERVICE_ROLE_KEY,
    WORKER_POLL_INTERVAL_MS: source.WORKER_POLL_INTERVAL_MS,
    R2_ACCOUNT_ID: source.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: source.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: source.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: source.R2_BUCKET_NAME,
    OPENAI_API_KEY: source.OPENAI_API_KEY,
    OPENAI_CONCEPT_MODEL: source.OPENAI_CONCEPT_MODEL,
    OPENAI_TTS_MODEL: source.OPENAI_TTS_MODEL,
    OPENAI_TTS_VOICE: source.OPENAI_TTS_VOICE,
    PREVIEW_PROVIDER: source.PREVIEW_PROVIDER,
    SCENE_VIDEO_PROVIDER: source.SCENE_VIDEO_PROVIDER,
    RUNWAYML_API_SECRET: source.RUNWAYML_API_SECRET,
    RUNWAY_IMAGE_MODEL: source.RUNWAY_IMAGE_MODEL,
    RUNWAY_VIDEO_MODEL: source.RUNWAY_VIDEO_MODEL,
    LOCAL_INFERENCE_BASE_URL: source.LOCAL_INFERENCE_BASE_URL,
    LOCAL_IMAGE_MODEL: source.LOCAL_IMAGE_MODEL,
    LOCAL_VIDEO_MODEL: source.LOCAL_VIDEO_MODEL,
    LOCAL_DEVICE: source.LOCAL_DEVICE,
    LOCAL_DTYPE: source.LOCAL_DTYPE,
    LOCAL_ENABLE_CPU_OFFLOAD: source.LOCAL_ENABLE_CPU_OFFLOAD,
    LOCAL_INFERENCE_TIMEOUT_MS: source.LOCAL_INFERENCE_TIMEOUT_MS
  }
}

export function parseWorkerEnvironment(
  source: NodeJS.ProcessEnv | Record<string, string | undefined>
) {
  return workerEnvironmentSchema.parse(buildWorkerEnvironmentInput(source))
}

export function safeParseWorkerEnvironment(
  source: NodeJS.ProcessEnv | Record<string, string | undefined>
) {
  return workerEnvironmentSchema.safeParse(buildWorkerEnvironmentInput(source))
}

export function getWorkerEnvironmentConfigurationIssues(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
) {
  const result = safeParseWorkerEnvironment(source)

  if (result.success) {
    return []
  }

  return result.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : ""
    return `${path}${issue.message}`
  })
}

export function hasWorkerEnvironmentConfiguration() {
  return safeParseWorkerEnvironment(process.env).success
}

export function getWorkerEnvironment() {
  return parseWorkerEnvironment(process.env)
}
