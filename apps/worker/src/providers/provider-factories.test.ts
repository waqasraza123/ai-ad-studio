import { describe, expect, it } from "vitest"
import { parseWorkerEnvironment } from "../lib/env"
import { LocalHttpPreviewProvider } from "./local-http-preview-provider"
import { LocalHttpSceneVideoProvider } from "./local-http-scene-video-provider"
import { MockPreviewProvider } from "./mock-preview-provider"
import { createPreviewProvider, createSceneVideoProvider } from "./provider-factories"
import { RunwayPreviewProvider } from "./runway-preview-provider"
import { RunwayVideoProvider } from "./runway-video-provider"

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

describe("provider factories", () => {
  it("returns runway providers for the default configuration", () => {
    const environment = parseWorkerEnvironment({
      ...buildBaseEnv(),
      RUNWAYML_API_SECRET: "runway-secret"
    })

    expect(createPreviewProvider(environment)).toBeInstanceOf(RunwayPreviewProvider)
    expect(createSceneVideoProvider(environment)).toBeInstanceOf(RunwayVideoProvider)
  })

  it("returns local-http providers when local providers are selected", () => {
    const environment = parseWorkerEnvironment({
      ...buildBaseEnv(),
      LOCAL_INFERENCE_BASE_URL: "http://127.0.0.1:8788",
      LOCAL_VIDEO_MODEL: "cogvideox1.5-5b-i2v",
      PREVIEW_PROVIDER: "local_http",
      SCENE_VIDEO_PROVIDER: "local_http"
    })

    expect(createPreviewProvider(environment)).toBeInstanceOf(LocalHttpPreviewProvider)
    expect(createSceneVideoProvider(environment)).toBeInstanceOf(
      LocalHttpSceneVideoProvider
    )
  })

  it("returns the mock preview provider when preview provider is mock", () => {
    const environment = parseWorkerEnvironment({
      ...buildBaseEnv(),
      LOCAL_INFERENCE_BASE_URL: "http://127.0.0.1:8788",
      LOCAL_VIDEO_MODEL: "cogvideox1.5-5b-i2v",
      PREVIEW_PROVIDER: "mock",
      SCENE_VIDEO_PROVIDER: "local_http"
    })

    expect(createPreviewProvider(environment)).toBeInstanceOf(MockPreviewProvider)
  })
})
