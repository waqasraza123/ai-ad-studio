import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listShowcaseItemsByOwner } from "@/server/showcase/showcase-repository"
import { ShowcaseGalleryGrid } from "@/features/showcase/components/showcase-gallery-grid"

export default async function DashboardShowcasePage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const showcaseItems = await listShowcaseItemsByOwner(user.id)

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          Showcase
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
          Public demo gallery manager
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Publish selected exports into a public showcase grouped by template, format, and platform preset.
        </p>
      </section>

      <ShowcaseGalleryGrid showcaseItems={showcaseItems} />
    </div>
  )
}
