import { getWorkerEnvironment } from "@/lib/env"

type ReferenceImageInput = {
  tag?: string
  uri: string
}

type RunwayPreviewProviderInput = {
  angle: string
  hook: string
  productName: string
  title: string
  visualDirection: string
  referenceImages: ReferenceImageInput[]
}

type RunwayTaskResponse = {
  id: string
}

type RunwayTaskStatusResponse = {
  id: string
  status?: string
  output?: unknown
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

function extractImageUrl(task: RunwayTaskStatusResponse) {
  const candidates = collectStringValues(task.output)

  return (
    candidates.find((value) => {
      const normalized = value.toLowerCase()

      return (
        normalized.startsWith("https://") &&
        (normalized.includes(".png") ||
          normalized.includes(".jpg") ||
          normalized.includes(".jpeg") ||
          normalized.includes(".webp") ||
          normalized.includes("image"))
      )
    }) ?? null
  )
}

function buildPrompt(input: RunwayPreviewProviderInput) {
  return [
    `Create a premium ecommerce ad concept image for ${input.productName}.`,
    `Concept title: ${input.title}.`,
    `Marketing angle: ${input.angle}.`,
    `Hook: ${input.hook}.`,
    `Visual direction: ${input.visualDirection}.`,
    `The image should feel like a polished vertical ad preview, product-centric, cinematic, clean, and premium.`,
    `No text overlay, no watermark, no collage, no UI, no split layout.`
  ].join(" ")
}

export class RunwayPreviewProvider {
  private readonly apiKey: string
  private readonly imageModel: string

  constructor() {
    const environment = getWorkerEnvironment()

    this.apiKey = environment.RUNWAYML_API_SECRET
    this.imageModel = environment.RUNWAY_IMAGE_MODEL
  }

  private async createTask(input: RunwayPreviewProviderInput) {
    const response = await fetch("https://api.dev.runwayml.com/v1/text_to_image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06"
      },
      body: JSON.stringify({
        model: this.imageModel,
        promptText: buildPrompt(input),
        ratio: "1080:1920",
        referenceImages: input.referenceImages.slice(0, 3)
      })
    })

    if (!response.ok) {
      throw new Error(`Runway task creation failed with status ${response.status}`)
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

  async generatePreview(input: RunwayPreviewProviderInput) {
    const task = await this.createTask(input)

    for (let attempt = 0; attempt < 24; attempt += 1) {
      await wait(5000)

      const currentTask = await this.getTask(task.id)
      const status = toNormalizedStatus(currentTask.status)

      if (status === "SUCCEEDED") {
        const imageUrl = extractImageUrl(currentTask)

        if (!imageUrl) {
          throw new Error("Runway task succeeded without a readable image URL")
        }

        return {
          imageUrl,
          taskId: task.id
        }
      }

      if (status === "FAILED" || status === "CANCELED" || status === "CANCELLED") {
        throw new Error(`Runway preview generation failed with status ${status}`)
      }
    }

    throw new Error("Runway preview generation timed out")
  }
}
