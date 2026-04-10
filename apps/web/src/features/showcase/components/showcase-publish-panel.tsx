import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import {
  publishShowcaseItemAction,
  unpublishShowcaseItemAction
} from "@/features/showcase/actions/publish-showcase-item"
import { getServerI18n } from "@/lib/i18n/server"
import type { AppMessageKey } from "@/lib/i18n/messages/en"
import type { ShowcaseItemRecord } from "@/server/database/types"

type ShowcasePublishPanelProps = {
  eligibilityReason: AppMessageKey | null
  exportId: string
  isEligible: boolean
  showcaseItem: ShowcaseItemRecord | null
}

export async function ShowcasePublishPanel({
  eligibilityReason,
  exportId,
  isEligible,
  showcaseItem
}: ShowcasePublishPanelProps) {
  const { t } = await getServerI18n()
  const publishAction = publishShowcaseItemAction.bind(null, exportId)
  const unpublishAction = unpublishShowcaseItemAction.bind(null, exportId)

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("showcase.publish.eyebrow")}
      </p>

      <div className="mt-4 space-y-4">
        {!isEligible ? (
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {eligibilityReason ? t(eligibilityReason) : t("showcase.publish.ineligible")}
          </div>
        ) : showcaseItem?.is_published ? (
          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            {t("showcase.publish.published")}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
            {t("showcase.publish.ready")}
          </div>
        )}

        {isEligible && !showcaseItem?.is_published ? (
          <form action={publishAction} className="space-y-4">
            <textarea
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              name="summary"
              placeholder={t("showcase.publish.placeholder")}
            />
            <FormSubmitButton pendingLabel={t("showcase.publish.pending")}>
              {t("showcase.publish.action")}
            </FormSubmitButton>
          </form>
        ) : null}

        {isEligible && showcaseItem?.is_published ? (
          <form action={unpublishAction}>
            <FormSubmitButton
              variant="secondary"
              pendingLabel={t("showcase.publish.unpublishPending")}
            >
              {t("showcase.publish.unpublishAction")}
            </FormSubmitButton>
          </form>
        ) : null}
      </div>
    </SurfaceCard>
  )
}
