import { z } from "zod"
import { modestZodString } from "@/lib/modest-wording"

export const createProjectSchema = z.object({
  name: modestZodString(z.string().trim().min(2).max(100))
})

export const projectBriefSchema = z.object({
  productName: modestZodString(z.string().trim().max(120)).optional().or(z.literal("")),
  productDescription: modestZodString(z.string().trim().max(2000))
    .optional()
    .or(z.literal("")),
  offerText: modestZodString(z.string().trim().max(300)).optional().or(z.literal("")),
  callToAction: modestZodString(z.string().trim().max(120))
    .optional()
    .or(z.literal("")),
  targetAudience: modestZodString(z.string().trim().max(300))
    .optional()
    .or(z.literal("")),
  brandTone: modestZodString(z.string().trim().max(120)).optional().or(z.literal("")),
  visualStyle: modestZodString(z.string().trim().max(120)).optional().or(z.literal(""))
})

export const createAssetPlaceholderSchema = z.object({
  projectId: z.string().uuid(),
  kind: z.enum(["product_image", "logo"]),
  fileName: modestZodString(z.string().trim().min(1).max(255)),
  mimeType: modestZodString(z.string().trim().min(1).max(120)),
  sizeBytes: z.number().int().positive().max(20 * 1024 * 1024)
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type ProjectBriefInput = z.infer<typeof projectBriefSchema>
export type CreateAssetPlaceholderInput = z.infer<typeof createAssetPlaceholderSchema>
