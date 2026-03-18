import { z } from "zod"

export const reviewedConceptSchema = z.object({
  safeHook: z.string().min(1).max(220),
  safeScript: z.string().min(1).max(700),
  riskFlags: z.array(z.string().min(1).max(80)).max(6),
  reviewNotes: z.string().min(1).max(280),
  wasModified: z.boolean()
})

export type ReviewedConcept = z.infer<typeof reviewedConceptSchema>
