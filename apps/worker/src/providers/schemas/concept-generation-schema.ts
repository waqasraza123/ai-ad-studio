import { z } from "zod"

export const generatedConceptSchema = z.object({
  title: z.string().min(1).max(120),
  angle: z.enum(["Direct response", "Premium brand", "Curiosity"]),
  hook: z.string().min(1).max(220),
  script: z.string().min(1).max(700),
  captionStyle: z.string().min(1).max(120),
  visualDirection: z.string().min(1).max(320)
})

export const conceptGenerationResponseSchema = z.object({
  concepts: z
    .array(generatedConceptSchema)
    .length(3)
})

export type ConceptGenerationResponse = z.infer<
  typeof conceptGenerationResponseSchema
>
