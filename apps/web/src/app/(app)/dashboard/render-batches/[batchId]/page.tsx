import { notFound } from "next/navigation"
import { RenderBatchReviewGrid } from "@/features/renders/components/render-batch-review-grid"
import { RenderBatchReviewSummary } from "@/features/renders/components/render-batch-review-summary"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listExportsByProjectIdForOwner } from "@/server/exports/export-repository"
import { listAssetsByProjectIdForOwner } from "@/server/projects/asset-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"
import {
  getRenderBatchByIdForOwner,
  listExportsForRenderBatch
} from "@/server/render-batches/render-batch-repository"

type RenderBatchDetailPageProps = {
  params: Promise<{
    batchId: string
  }>
}

export default async function RenderBatchDetailPage({
  params
}: RenderBatchDetailPageProps) {
  const { batchId } = await params
  const user = await getAuthenticatedUser()

  if (!user) {
    notFound()
  }

  const batch = await getRenderBatchByIdForOwner(batchId, user.id)

  if (!batch) {
    notFound()
  }

  const [project, projectExports, projectAssets] = await Promise.all([
    getProjectByIdForOwner(batch.project_id, user.id),
    listExportsByProjectIdForOwner(batch.project_id, user.id),
    listAssetsByProjectIdForOwner(batch.project_id, user.id)
  ])

  if (!project) {
    notFound()
  }

  const batchExports = listExportsForRenderBatch({
    batchId,
    exports: projectExports
  })

  const assetsById = new Map(projectAssets.map((asset) => [asset.id, asset] as const))

  return (
    <div className="space-y-6">
      <RenderBatchReviewSummary
        batch={batch}
        exports={batchExports}
        projectName={project.name}
      />
      <RenderBatchReviewGrid
        assetsById={assetsById}
        batch={batch}
        exports={batchExports}
      />
    </div>
  )
}
