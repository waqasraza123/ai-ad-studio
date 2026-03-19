import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listDeliveryWorkspacesByOwner } from "@/server/delivery-workspaces/delivery-workspace-repository"
import { listProjectsByOwner } from "@/server/projects/project-repository"
import { DeliveryWorkspaceList } from "@/features/delivery/components/delivery-workspace-list"

export default async function DeliveryPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const [workspaces, projects] = await Promise.all([
    listDeliveryWorkspacesByOwner(user.id),
    listProjectsByOwner(user.id)
  ])

  const projectsById = new Map(projects.map((project) => [project.id, project]))

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          Delivery
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
          Finalized client delivery workspaces
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Delivery pages are only available for finalized canonical exports.
        </p>
      </section>

      <DeliveryWorkspaceList projectsById={projectsById} workspaces={workspaces} />
    </div>
  )
}
