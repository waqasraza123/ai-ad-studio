import type {
  SceneVideoGenerationProvider,
  SceneVideoGenerationProviderInput,
  SceneVideoGenerationProviderResult
} from "@/providers/media-provider-types"

type LocalHttpSceneVideoProviderOptions = {
  baseUrl: string
  model: string
  timeoutMs: number
}

export class LocalHttpSceneVideoProvider implements SceneVideoGenerationProvider {
  private readonly baseUrl: string
  private readonly model: string
  private readonly timeoutMs: number

  constructor(options: LocalHttpSceneVideoProviderOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "")
    this.model = options.model
    this.timeoutMs = options.timeoutMs
  }

  async generateSceneVideo(
    input: SceneVideoGenerationProviderInput
  ): Promise<SceneVideoGenerationProviderResult> {
    const response = await fetch(`${this.baseUrl}/v1/scene-video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        aspectRatio: input.aspectRatio,
        durationSeconds: input.durationSeconds,
        model: this.model,
        promptImage: input.promptImage,
        promptText: input.promptText
      }),
      signal: AbortSignal.timeout(this.timeoutMs)
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(
        `Local scene video request failed with status ${response.status}: ${errorBody}`
      )
    }

    const payload = (await response.json()) as {
      artifactUrl?: unknown
      externalJobId?: unknown
      metadata?: Record<string, unknown>
      model?: unknown
      provider?: unknown
    }

    if (typeof payload.artifactUrl !== "string" || payload.artifactUrl.length === 0) {
      throw new Error("Local scene video response did not include artifactUrl")
    }

    return {
      artifactUrl: payload.artifactUrl,
      externalJobId:
        typeof payload.externalJobId === "string" ? payload.externalJobId : undefined,
      metadata:
        payload.metadata && typeof payload.metadata === "object" ? payload.metadata : undefined,
      model: typeof payload.model === "string" ? payload.model : this.model,
      provider: "local_http"
    }
  }
}
