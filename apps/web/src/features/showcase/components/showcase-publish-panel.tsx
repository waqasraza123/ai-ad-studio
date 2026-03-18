import type { ShowcaseItemRecord } from "@/server/database/types"
import {
  publishShowcaseItemAction,
  unpublishShowcaseItemAction
} from "@/features/showcase/actions/publish-showcase-item"
import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"

type ShowcasePublishPanelProps = {
  exportId: string
  showcaseItem: ShowcaseItemRecord | null
}

export function ShowcasePublishPanel({
  exportId,
  showcaseItem
}: ShowcasePublishPanelProps) {
  const publishAction = publishShowcaseItemAction.bind(null, exportId)
  const unpublishAction = unpublishShowcaseItemAction.bind(null, exportId)

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Showcase
      </p>

      <div className="mt-4 space-y-4">
        {showcaseItem?.is_published ? (
          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            This export is published in the public showcase gallery.
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
            Publish this export to the public demo gallery.
          </div>
        )}

        {!showcaseItem?.is_published ? (
          <form action={publishAction} className="space-y-4">
            <textarea
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              name="summary"
              placeholder="Optional gallery summary"
            />
            <Button>Publish to showcase</Button>
          </form>
        ) : (
          <form action={unpublishAction}>
            <Button variant="secondary">Unpublish showcase item</Button>
          </form>
        )}
      </div>
    </SurfaceCard>
  )
}
