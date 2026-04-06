import { describe, expect, it } from "vitest"
import {
  getWorkerEnvironmentConfigurationIssues,
  parseWorkerEnvironment,
  safeParseWorkerEnvironment
} from "./env"

function buildBaseEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role",
    WORKER_POLL_INTERVAL_MS: "3000",
    R2_ACCOUNT_ID: "r2-account",
    R2_ACCESS_KEY_ID: "r2-access",
    R2_SECRET_ACCESS_KEY: "r2-secret",
    R2_BUCKET_NAME: "bucket",
    OPENAI_API_KEY: "openai-key"
  }
}

describe("worker environment parsing", () => {
  it("parses the backward-compatible runway-only configuration", () => {
    const environment = parseWorkerEnvironment({
      ...buildBaseEnv(),
      RUNWAYML_API_SECRET: "runway-secret"
    })

    expect(environment.PREVIEW_PROVIDER).toBe("runway")
    expect(environment.SCENE_VIDEO_PROVIDER).toBe("runway")
    expect(environment.RUNWAY_VIDEO_MODEL).toBe("gen4_turbo")
  })

  it("parses the hybrid configuration without requiring local preview settings", () => {
    const environment = parseWorkerEnvironment({
      ...buildBaseEnv(),
      LOCAL_INFERENCE_BASE_URL: "http://127.0.0.1:8788",
      LOCAL_VIDEO_MODEL: "cogvideox1.5-5b-i2v",
      RUNWAYML_API_SECRET: "runway-secret",
      SCENE_VIDEO_PROVIDER: "local_http"
    })

    expect(environment.PREVIEW_PROVIDER).toBe("runway")
    expect(environment.SCENE_VIDEO_PROVIDER).toBe("local_http")
    expect(environment.LOCAL_VIDEO_MODEL).toBe("cogvideox1.5-5b-i2v")
  })

  it("parses the fully local configuration without a runway key", () => {
    const environment = parseWorkerEnvironment({
      ...buildBaseEnv(),
      LOCAL_IMAGE_MODEL: "flux-schnell",
      LOCAL_INFERENCE_BASE_URL: "http://127.0.0.1:8788",
      LOCAL_VIDEO_MODEL: "cogvideox1.5-5b-i2v",
      PREVIEW_PROVIDER: "local_http",
      SCENE_VIDEO_PROVIDER: "local_http"
    })

    expect(environment.RUNWAYML_API_SECRET).toBeUndefined()
    expect(environment.PREVIEW_PROVIDER).toBe("local_http")
    expect(environment.SCENE_VIDEO_PROVIDER).toBe("local_http")
  })

  it("fails with a clear error when runway is selected without a key", () => {
    const result = safeParseWorkerEnvironment({
      ...buildBaseEnv(),
      SCENE_VIDEO_PROVIDER: "local_http",
      LOCAL_INFERENCE_BASE_URL: "http://127.0.0.1:8788",
      LOCAL_VIDEO_MODEL: "cogvideox1.5-5b-i2v"
    })

    expect(result.success).toBe(false)
    expect(getWorkerEnvironmentConfigurationIssues({
      ...buildBaseEnv(),
      SCENE_VIDEO_PROVIDER: "local_http",
      LOCAL_INFERENCE_BASE_URL: "http://127.0.0.1:8788",
      LOCAL_VIDEO_MODEL: "cogvideox1.5-5b-i2v"
    })).toContain(
      "RUNWAYML_API_SECRET: RUNWAYML_API_SECRET is required when PREVIEW_PROVIDER or SCENE_VIDEO_PROVIDER uses runway."
    )
  })

  it("fails fast for unsupported local model names", () => {
    const result = safeParseWorkerEnvironment({
      ...buildBaseEnv(),
      LOCAL_IMAGE_MODEL: "made-up-model",
      LOCAL_INFERENCE_BASE_URL: "http://127.0.0.1:8788",
      LOCAL_VIDEO_MODEL: "cogvideox1.5-5b-i2v",
      PREVIEW_PROVIDER: "local_http",
      SCENE_VIDEO_PROVIDER: "local_http"
    })

    expect(result.success).toBe(false)
  })
})
