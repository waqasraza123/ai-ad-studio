import type {
  SceneVideoGenerationProvider,
  SceneVideoGenerationProviderInput,
  SceneVideoGenerationProviderResult
} from "@/providers/media-provider-types"

type RunwayTaskResponse = {
  id: string
}

type RunwayTaskStatusResponse = {
  id: string
  status?: string
  output?: unknown
}

function toRunwayRatio(aspectRatio: "9:16" | "1:1" | "16:9") {
  if (aspectRatio === "1:1") {
    return "1080:1080"
  }

  if (aspectRatio === "16:9") {
    return "1280:720"
  }

  return "720:1280"
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

function toNormalizedStatus(value: string | undefined) {
  return (value ?? "").toUpperCase()
}

function collectStringValues(value: unknown, collected: string[] = []) {
  if (typeof value === "string") {
    collected.push(value)
    return collected
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      collectStringValues(item, collected)
    })
    return collected
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => {
      collectStringValues(item, collected)
    })
  }

  return collected
}

function extractVideoUrl(task: RunwayTaskStatusResponse) {
  const candidates = collectStringValues(task.output)

  return (
    candidates.find((value) => {
      const normalized = value.toLowerCase()

      return (
        normalized.startsWith("https://") &&
        (normalized.includes(".mp4") || normalized.includes("video"))
      )
    }) ?? null
  )
}

type RunwayVideoProviderOptions = {
  apiKey: string
  videoModel: string
}

export class RunwayVideoProvider implements SceneVideoGenerationProvider {
  private readonly apiKey: string
  private readonly videoModel: string

  constructor(options: RunwayVideoProviderOptions) {
    this.apiKey = options.apiKey
    this.videoModel = options.videoModel
  }

  private async createTask(input: SceneVideoGenerationProviderInput) {
    const response = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06"
      },
      body: JSON.stringify({
        duration: input.durationSeconds,
        model: this.videoModel,
        promptImage: input.promptImage,
        promptText: input.promptText,
        ratio: toRunwayRatio(input.aspectRatio)
      })
    })

    if (!response.ok) {
      throw new Error(`Runway image_to_video failed with status ${response.status}`)
    }

    return (await response.json()) as RunwayTaskResponse
  }

  private async getTask(taskId: string) {
    const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "X-Runway-Version": "2024-11-06"
      }
    })

    if (!response.ok) {
      throw new Error(`Runway task retrieval failed with status ${response.status}`)
    }

    return (await response.json()) as RunwayTaskStatusResponse
  }

  async generateSceneVideo(
    input: SceneVideoGenerationProviderInput
  ): Promise<SceneVideoGenerationProviderResult> {
    const task = await this.createTask(input)

    for (let attempt = 0; attempt < 24; attempt += 1) {
      await wait(5000)

      const currentTask = await this.getTask(task.id)
      const status = toNormalizedStatus(currentTask.status)

      if (status === "SUCCEEDED") {
        const videoUrl = extractVideoUrl(currentTask)

        if (!videoUrl) {
          throw new Error("Runway scene generation succeeded without a readable video URL")
        }

        return {
          artifactUrl: videoUrl,
          externalJobId: task.id,
          metadata: {
            runwayTaskId: task.id
          },
          model: this.videoModel,
          provider: "runway"
        }
      }

      if (status === "FAILED" || status === "CANCELED" || status === "CANCELLED") {
        throw new Error(`Runway scene generation failed with status ${status}`)
      }
    }

    throw new Error("Runway scene generation timed out")
  }
}
