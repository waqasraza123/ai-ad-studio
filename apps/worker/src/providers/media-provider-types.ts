export type ReferenceImageInput = {
  tag?: string
  uri: string
}

export type PreviewGenerationProviderInput = {
  angle: string
  hook: string
  productName: string
  title: string
  visualDirection: string
  referenceImages: ReferenceImageInput[]
}

export type PreviewGenerationProviderResult = {
  provider: "runway" | "local_http" | "mock"
  model: string
  previewDataUrl: string
  externalJobId?: string
  metadata?: Record<string, unknown>
}

export type SceneVideoGenerationProviderInput = {
  aspectRatio: "9:16" | "1:1" | "16:9"
  durationSeconds: number
  promptImage: string
  promptText: string
}

export type SceneVideoGenerationProviderResult = {
  artifactUrl: string
  provider: "runway" | "local_http"
  model: string
  externalJobId?: string
  metadata?: Record<string, unknown>
}

export interface PreviewGenerationProvider {
  generatePreview(
    input: PreviewGenerationProviderInput
  ): Promise<PreviewGenerationProviderResult>
}

export interface SceneVideoGenerationProvider {
  generateSceneVideo(
    input: SceneVideoGenerationProviderInput
  ): Promise<SceneVideoGenerationProviderResult>
}
