import type {
  PreviewGenerationProvider,
  PreviewGenerationProviderInput,
  PreviewGenerationProviderResult
} from "@/providers/media-provider-types"

type LocalHttpPreviewProviderOptions = {
  baseUrl: string
  model: string
  timeoutMs: number
}

export class LocalHttpPreviewProvider implements PreviewGenerationProvider {
  private readonly baseUrl: string
  private readonly model: string
  private readonly timeoutMs: number

  constructor(options: LocalHttpPreviewProviderOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "")
    this.model = options.model
    this.timeoutMs = options.timeoutMs
  }

  async generatePreview(
    input: PreviewGenerationProviderInput
  ): Promise<PreviewGenerationProviderResult> {
    const response = await fetch(`${this.baseUrl}/v1/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        promptText: [
          `Create a premium ecommerce ad concept image for ${input.productName}.`,
          `Concept title: ${input.title}.`,
          `Marketing angle: ${input.angle}.`,
          `Hook: ${input.hook}.`,
          `Visual direction: ${input.visualDirection}.`,
          "Keep the result product-centric, cinematic, clean, and premium."
        ].join(" "),
        referenceImages: input.referenceImages,
        targetHeight: 1920,
        targetWidth: 1080
      }),
      signal: AbortSignal.timeout(this.timeoutMs)
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(
        `Local preview request failed with status ${response.status}: ${errorBody}`
      )
    }

    const payload = (await response.json()) as {
      imageDataUrl?: unknown
      metadata?: Record<string, unknown>
      model?: unknown
      provider?: unknown
    }

    if (typeof payload.imageDataUrl !== "string" || payload.imageDataUrl.length === 0) {
      throw new Error("Local preview response did not include imageDataUrl")
    }

    return {
      metadata:
        payload.metadata && typeof payload.metadata === "object" ? payload.metadata : undefined,
      model: typeof payload.model === "string" ? payload.model : this.model,
      previewDataUrl: payload.imageDataUrl,
      provider: "local_http"
    }
  }
}
