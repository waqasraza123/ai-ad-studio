export type RuntimeSetupContext = "homepage" | "dashboard"

export type RuntimeModeDefinition = {
  id: "runway" | "hybrid" | "local" | "mock"
  envLines: string[]
  recommended?: boolean
  experimental?: boolean
  muted?: boolean
}

export const RUNTIME_SETUP_MODAL_VERSION = "v1"
export const RUNTIME_SETUP_DISMISSAL_KEY = `ai-ad-studio:runtime-setup-modal:${RUNTIME_SETUP_MODAL_VERSION}:dismissed`
export const RUNTIME_SETUP_GUIDE_URL =
  "https://github.com/waqasraza123/ai-ad-studio#local-development"

export const runtimeModeDefinitions: RuntimeModeDefinition[] = [
  {
    id: "runway",
    recommended: true,
    envLines: [
      "PREVIEW_PROVIDER=runway",
      "SCENE_VIDEO_PROVIDER=runway",
      "RUNWAYML_API_SECRET=your-runway-key",
      "RUNWAY_IMAGE_MODEL=gen4_image_turbo",
      "RUNWAY_VIDEO_MODEL=gen4_turbo"
    ]
  },
  {
    id: "hybrid",
    envLines: [
      "PREVIEW_PROVIDER=runway",
      "SCENE_VIDEO_PROVIDER=local_http",
      "RUNWAYML_API_SECRET=your-runway-key",
      "LOCAL_INFERENCE_BASE_URL=http://127.0.0.1:8788",
      "LOCAL_VIDEO_MODEL=cogvideox1.5-5b-i2v",
      "LOCAL_DEVICE=cuda",
      "LOCAL_DTYPE=bf16"
    ]
  },
  {
    id: "local",
    experimental: true,
    envLines: [
      "PREVIEW_PROVIDER=local_http",
      "SCENE_VIDEO_PROVIDER=local_http",
      "LOCAL_INFERENCE_BASE_URL=http://127.0.0.1:8788",
      "LOCAL_IMAGE_MODEL=flux-schnell",
      "LOCAL_VIDEO_MODEL=cogvideox1.5-5b-i2v",
      "LOCAL_DEVICE=cuda",
      "LOCAL_DTYPE=bf16",
      "LOCAL_ENABLE_CPU_OFFLOAD=false"
    ]
  },
  {
    id: "mock",
    muted: true,
    envLines: [
      "PREVIEW_PROVIDER=mock",
      "SCENE_VIDEO_PROVIDER=local_http",
      "LOCAL_INFERENCE_BASE_URL=http://127.0.0.1:8788",
      "LOCAL_VIDEO_MODEL=cogvideox1.5-5b-i2v"
    ]
  }
]

export const machineRecommendations = [
  {
    id: "hosted"
  },
  {
    id: "hybrid"
  },
  {
    id: "local"
  }
]

export const workerEnvExportLines = ["set -a", "source .env.local", "set +a"]
