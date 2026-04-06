import type { WorkerEnvironment } from "@/lib/env"
import { LocalHttpPreviewProvider } from "@/providers/local-http-preview-provider"
import { LocalHttpSceneVideoProvider } from "@/providers/local-http-scene-video-provider"
import { MockPreviewProvider } from "@/providers/mock-preview-provider"
import type {
  PreviewGenerationProvider,
  SceneVideoGenerationProvider
} from "@/providers/media-provider-types"
import { RunwayPreviewProvider } from "@/providers/runway-preview-provider"
import { RunwayVideoProvider } from "@/providers/runway-video-provider"

export function createPreviewProvider(
  environment: WorkerEnvironment
): PreviewGenerationProvider {
  if (environment.PREVIEW_PROVIDER === "mock") {
    return new MockPreviewProvider()
  }

  if (environment.PREVIEW_PROVIDER === "local_http") {
    return new LocalHttpPreviewProvider({
      baseUrl: environment.LOCAL_INFERENCE_BASE_URL!,
      model: environment.LOCAL_IMAGE_MODEL,
      timeoutMs: environment.LOCAL_INFERENCE_TIMEOUT_MS
    })
  }

  return new RunwayPreviewProvider({
    apiKey: environment.RUNWAYML_API_SECRET!,
    imageModel: environment.RUNWAY_IMAGE_MODEL
  })
}

export function createSceneVideoProvider(
  environment: WorkerEnvironment
): SceneVideoGenerationProvider {
  if (environment.SCENE_VIDEO_PROVIDER === "local_http") {
    return new LocalHttpSceneVideoProvider({
      baseUrl: environment.LOCAL_INFERENCE_BASE_URL!,
      model: environment.LOCAL_VIDEO_MODEL,
      timeoutMs: environment.LOCAL_INFERENCE_TIMEOUT_MS
    })
  }

  return new RunwayVideoProvider({
    apiKey: environment.RUNWAYML_API_SECRET!,
    videoModel: environment.RUNWAY_VIDEO_MODEL
  })
}
