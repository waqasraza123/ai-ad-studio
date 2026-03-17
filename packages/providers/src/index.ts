export type ConceptDraft = {
  title: string
  angle: string
  hook: string
  script: string
}

export interface ConceptGenerationProvider {
  generateConcepts(input: { projectId: string }): Promise<ConceptDraft[]>
}
