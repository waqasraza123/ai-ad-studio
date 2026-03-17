import { notFound } from "next/navigation"
import { ProjectBriefForm } from "@/features/projects/components/project-brief-form"
import { ProjectUploadPanel } from "@/features/projects/components/project-upload-panel"
import { toProjectDetailSummary } from "@/features/projects/mappers/project-view-model"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listAssetsByProjectIdForOwner } from "@/server/projects/asset-repository"
import { getProjectInputByProjectIdForOwner } from "@/server/projects/project-input-repository"
import { getProjectByIdForOwner } from "@/server/projects/project-repository"

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectDetailPage({
  params
}: ProjectDetailPageProps) {
  const { projectId } = await params
  const user = await getAuthenticatedUser()

  if (!user) {
    notFound()
  }

  const [project, projectInput, assets] = await Promise.all([
    getProjectByIdForOwner(projectId, user.id),
    getProjectInputByProjectIdForOwner(projectId, user.id),
    listAssetsByProjectIdForOwner(projectId, user.id)
  ])

  if (!project) {
    notFound()
  }

  const summary = toProjectDetailSummary({
    assets,
    project,
    projectInput
  })

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Project detail
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            {summary.projectName}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            This page now holds the persisted project inputs and asset intake flow.
            It becomes the concept generation workspace in the next phase.
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Project summary
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Status</p>
              <p className="mt-2 text-lg font-medium text-white">
                {summary.projectStatus}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Assets</p>
              <p className="mt-2 text-lg font-medium text-white">
                {summary.assetCount}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Duration</p>
              <p className="mt-2 text-lg font-medium text-white">
                {summary.durationLabel}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Brief</p>
              <p className="mt-2 text-lg font-medium text-white">
                {summary.hasBrief ? "Saved" : "Incomplete"}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-400">
            Created {summary.createdAtLabel}
          </p>
        </SurfaceCard>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ProjectBriefForm projectId={projectId} projectInput={projectInput} />
        <ProjectUploadPanel projectId={projectId} assets={assets} />
      </div>
    </div>
  )
}
