import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import {
  publishShowcaseItemAction,
  unpublishShowcaseItemAction
} from "@/features/showcase/actions/publish-showcase-item"
import type { ShowcaseItemRecord } from "@/server/database/types"

type ShowcasePublishPanelProps = {
  eligibilityReason: string | null
  exportId: string
  isEligible: boolean
  showcaseItem: ShowcaseItemRecord | null
}

export function ShowcasePublishPanel({
  eligibilityReason,
  exportId,
  isEligible,
  showcaseItem
}: ShowcasePublishPanelProps) {
  const publishAction = publishShowcaseItemAction.bind(null, exportId)
  const unpublishAction = unpublishShowcaseItemAction.bind(null, exportId)

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Public showcase
      </p>

      <div className="mt-4 space-y-4">
        {!isEligible ? (
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {eligibilityReason ?? "Only reviewed winners can be published publicly."}
          </div>
        ) : showcaseItem?.is_published ? (
          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            This reviewed winner is published in the public showcase gallery.
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
            Publish this reviewed winner to the public demo gallery.
          </div>
        )}

        {isEligible && !showcaseItem?.is_published ? (
          <form action={publishAction} className="space-y-4">
            <textarea
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              name="summary"
              placeholder="Optional gallery summary"
            />
            <FormSubmitButton pendingLabel="Publishing…">Publish to showcase</FormSubmitButton>
          </form>
        ) : null}

        {isEligible && showcaseItem?.is_published ? (
          <form action={unpublishAction}>
            <FormSubmitButton variant="secondary" pendingLabel="Unpublishing…">
              Unpublish showcase item
            </FormSubmitButton>
          </form>
        ) : null}
      </div>
    </SurfaceCard>
  )
}
