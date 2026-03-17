export type RenderPlan = {
  durationSeconds: number
  aspectRatio: string
}

export function createRenderPlan(durationSeconds: number, aspectRatio: string): RenderPlan {
  return {
    durationSeconds,
    aspectRatio
  }
}
