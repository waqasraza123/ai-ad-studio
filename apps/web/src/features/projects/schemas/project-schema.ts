import { z } from "zod"

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(100)
})

export const projectBriefSchema = z.object({
  productName: z.string().trim().max(120).optional().or(z.literal("")),
  productDescription: z.string().trim().max(2000).optional().or(z.literal("")),
  offerText: z.string().trim().max(300).optional().or(z.literal("")),
  callToAction: z.string().trim().max(120).optional().or(z.literal("")),
  targetAudience: z.string().trim().max(300).optional().or(z.literal("")),
  brandTone: z.string().trim().max(120).optional().or(z.literal("")),
  visualStyle: z.string().trim().max(120).optional().or(z.literal(""))
})

export const createAssetPlaceholderSchema = z.object({
  projectId: z.string().uuid(),
  kind: z.enum(["product_image", "logo"]),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  sizeBytes: z.number().int().positive().max(20 * 1024 * 1024)
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type ProjectBriefInput = z.infer<typeof projectBriefSchema>
export type CreateAssetPlaceholderInput = z.infer<typeof createAssetPlaceholderSchema>
