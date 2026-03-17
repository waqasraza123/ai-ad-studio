import type { SupabaseClient } from "@supabase/supabase-js"
import { MockConceptProvider } from "@/providers/mock-concept-provider"
import {
  createConceptsForProject,
  deleteConceptsByProjectId
} from "@/repositories/concepts-repository"
import {
  getProjectById,
  getProjectInputByProjectId,
  updateProjectStatus
} from "@/repositories/projects-repository"
import type { WorkerJobRecord } from "@/repositories/jobs-repository"

export async function handleGenerateConceptsJob(
  supabase: SupabaseClient,
  job: WorkerJobRecord
) {
  const [project, projectInput] = await Promise.all([
    getProjectById(supabase, job.project_id),
    getProjectInputByProjectId(supabase, job.project_id)
  ])

  if (!project) {
    throw new Error("Project not found for concept generation")
  }

  if (!projectInput) {
    throw new Error("Project brief not found for concept generation")
  }

  const provider = new MockConceptProvider()
  const conceptDrafts = provider.generateConcepts({
    brandTone: projectInput.brand_tone,
    offerText: projectInput.offer_text,
    productDescription: projectInput.product_description,
    productName: projectInput.product_name,
    targetAudience: projectInput.target_audience,
    visualStyle: projectInput.visual_style
  })

  await deleteConceptsByProjectId(supabase, job.project_id)

  await createConceptsForProject(
    supabase,
    conceptDrafts.map((concept, index) => ({
      angle: concept.angle,
      caption_style: concept.captionStyle,
      hook: concept.hook,
      owner_id: project.owner_id,
      project_id: project.id,
      script: concept.script,
      sort_order: index,
      status: "planned",
      title: concept.title,
      visual_direction: concept.visualDirection
    }))
  )

  await updateProjectStatus(supabase, {
    projectId: project.id,
    status: "concepts_ready"
  })

  return {
    conceptCount: conceptDrafts.length,
    projectId: project.id,
    provider: "mock-concept-provider"
  }
}
