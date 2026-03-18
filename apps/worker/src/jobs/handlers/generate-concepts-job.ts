import type { SupabaseClient } from "@supabase/supabase-js"
import { OpenAiClaimReviewProvider } from "@/providers/openai-claim-review-provider"
import { OpenAiConceptProvider } from "@/providers/openai-concept-provider"
import {
  createConceptsForProject,
  deleteConceptsByProjectId
} from "@/repositories/concepts-repository"
import type { WorkerJobRecord } from "@/repositories/jobs-repository"
import {
  getProjectById,
  getProjectInputByProjectId,
  updateProjectStatus
} from "@/repositories/projects-repository"

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

  const provider = new OpenAiConceptProvider()
  const reviewProvider = new OpenAiClaimReviewProvider()

  const conceptPayload = await provider.generateConcepts({
    brandTone: projectInput.brand_tone,
    callToAction: projectInput.call_to_action,
    offerText: projectInput.offer_text,
    productDescription: projectInput.product_description,
    productName: projectInput.product_name,
    targetAudience: projectInput.target_audience,
    visualStyle: projectInput.visual_style
  })

  const reviewedConcepts = await Promise.all(
    conceptPayload.concepts.map(async (concept) => {
      const review = await reviewProvider.reviewConcept({
        hook: concept.hook,
        offerText: projectInput.offer_text,
        productDescription: projectInput.product_description,
        script: concept.script
      })

      return {
        angle: concept.angle,
        caption_style: concept.captionStyle,
        hook: review.safeHook,
        risk_flags: review.riskFlags,
        safety_notes: review.reviewNotes,
        script: review.safeScript,
        title: concept.title,
        visual_direction: concept.visualDirection,
        was_safety_modified: review.wasModified
      }
    })
  )

  await deleteConceptsByProjectId(supabase, job.project_id)

  await createConceptsForProject(
    supabase,
    reviewedConcepts.map((concept, index) => ({
      angle: concept.angle,
      caption_style: concept.caption_style,
      hook: concept.hook,
      owner_id: project.owner_id,
      project_id: project.id,
      risk_flags: concept.risk_flags,
      safety_notes: concept.safety_notes,
      script: concept.script,
      sort_order: index,
      status: "planned",
      title: concept.title,
      visual_direction: concept.visual_direction,
      was_safety_modified: concept.was_safety_modified
    }))
  )

  await updateProjectStatus(supabase, {
    projectId: project.id,
    status: "concepts_ready"
  })

  return {
    conceptCount: reviewedConcepts.length,
    model: "openai",
    projectId: project.id,
    reviewedCount: reviewedConcepts.filter((concept) => concept.was_safety_modified).length
  }
}
