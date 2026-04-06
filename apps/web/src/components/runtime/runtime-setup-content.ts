export type RuntimeSetupContext = "homepage" | "dashboard"

export type RuntimeModeDefinition = {
  id: "runway" | "hybrid" | "local" | "mock"
  label: string
  eyebrow: string
  summary: string
  detail: string
  highlight: string
  compatibility: string
  envLines: string[]
  notes: string[]
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
    label: "Runway only",
    eyebrow: "Recommended",
    summary: "Full hosted premium path",
    detail:
      "Use Runway for both preview images and scene-video generation when you want the fastest supported path to the intended studio experience.",
    highlight: "Best full-capability path on Intel Macs and other non-GPU setups.",
    compatibility: "Hosted path",
    recommended: true,
    envLines: [
      "PREVIEW_PROVIDER=runway",
      "SCENE_VIDEO_PROVIDER=runway",
      "RUNWAYML_API_SECRET=your-runway-key",
      "RUNWAY_IMAGE_MODEL=gen4_image_turbo",
      "RUNWAY_VIDEO_MODEL=gen4_turbo"
    ],
    notes: [
      "Buy a Runway API plan, then add RUNWAYML_API_SECRET to .env.local.",
      "Leave both providers set to runway for the cleanest hosted setup."
    ]
  },
  {
    id: "hybrid",
    label: "Hybrid",
    eyebrow: "Advanced",
    summary: "Runway previews + local scene video",
    detail:
      "Keep previews on Runway while routing scene-video generation to the local HTTP sidecar for a lower-cost mixed runtime path.",
    highlight: "Lowest-risk GPU validation path once a supported Linux + NVIDIA box is available.",
    compatibility: "Hosted + local",
    envLines: [
      "PREVIEW_PROVIDER=runway",
      "SCENE_VIDEO_PROVIDER=local_http",
      "RUNWAYML_API_SECRET=your-runway-key",
      "LOCAL_INFERENCE_BASE_URL=http://127.0.0.1:8788",
      "LOCAL_VIDEO_MODEL=cogvideox1.5-5b-i2v",
      "LOCAL_DEVICE=cuda",
      "LOCAL_DTYPE=bf16"
    ],
    notes: [
      "Buy Runway, add RUNWAYML_API_SECRET, then switch only SCENE_VIDEO_PROVIDER to local_http.",
      "Run the local inference sidecar on a practical Linux + NVIDIA environment."
    ]
  },
  {
    id: "local",
    label: "Fully local",
    eyebrow: "Power user",
    summary: "Hardware-dependent full local stack",
    detail:
      "Use the local sidecar for both previews and scene video when you control the Python, CUDA, model, and GPU environment end to end.",
    highlight: "Practical only on supported Linux + NVIDIA hardware for full scene-video generation.",
    compatibility: "Local GPU",
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
    ],
    notes: [
      "Choose LOCAL_IMAGE_MODEL and LOCAL_VIDEO_MODEL based on the GPU tier you actually have.",
      "Treat CPU-only or Intel Mac scene-video as impractical rather than a supported target."
    ]
  },
  {
    id: "mock",
    label: "Lightweight dev",
    eyebrow: "Secondary",
    summary: "Mock previews + local scene video",
    detail:
      "Use mock preview generation when you want to exercise parts of the workflow without paying for hosted preview images.",
    highlight: "Useful for UI and job-flow development, not for proving premium output quality.",
    compatibility: "Dev/testing",
    muted: true,
    envLines: [
      "PREVIEW_PROVIDER=mock",
      "SCENE_VIDEO_PROVIDER=local_http",
      "LOCAL_INFERENCE_BASE_URL=http://127.0.0.1:8788",
      "LOCAL_VIDEO_MODEL=cogvideox1.5-5b-i2v"
    ],
    notes: [
      "Mock mode is a workflow aid, not a production-quality render path.",
      "Additional provider adapters may be added later; today the supported runtime paths are Runway, local HTTP inference, and mock preview mode."
    ]
  }
]

export const machineRecommendations = [
  {
    id: "hosted",
    label: "Hosted / recommended",
    summary: "Paid Runway for both previews and scene video.",
    detail: "Fastest full-capability path with no local GPU dependency."
  },
  {
    id: "hybrid",
    label: "Hybrid / advanced",
    summary: "Runway previews plus local scene video sidecar.",
    detail: "Best mixed setup once you have a supported remote GPU box."
  },
  {
    id: "local",
    label: "Local / experimental",
    summary: "Linux + NVIDIA required for practical full local video.",
    detail: "Treat Intel Macs and CPU-only boxes as preview-only, mock, or unsupported for scene video."
  }
]

export const runwayUpgradeSteps = [
  "Buy a Runway API plan and generate a secret key.",
  "Add RUNWAYML_API_SECRET to .env.local.",
  "Set PREVIEW_PROVIDER=runway and choose whether SCENE_VIDEO_PROVIDER stays runway or switches to local_http for hybrid mode.",
  "Adjust RUNWAY_IMAGE_MODEL or RUNWAY_VIDEO_MODEL if you want to test a different hosted model."
]

export const workerEnvExportLines = ["set -a", "source .env.local", "set +a"]
