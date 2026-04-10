import { createShareLinkAction } from "@/features/exports/actions/create-share-link"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"

type ShareLinkPanelProps = {
  exportId: string
  shareUrl: string | null
}

export async function ShareLinkPanel({
  exportId,
  shareUrl
}: ShareLinkPanelProps) {
  const { t } = await getServerI18n()
  const action = createShareLinkAction.bind(null, exportId)

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("exports.shareLink.eyebrow")}
      </p>

      <div className="mt-4 space-y-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
          {t("exports.shareLink.description")}
        </div>

        {shareUrl ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="break-all text-sm text-slate-300">{shareUrl}</p>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            {t("exports.shareLink.empty")}
          </div>
        )}

        <form action={action}>
          <FormSubmitButton pendingLabel={t("exports.shareLink.pending")}>
            {shareUrl
              ? t("exports.shareLink.reuse")
              : t("exports.shareLink.create")}
          </FormSubmitButton>
        </form>
      </div>
    </SurfaceCard>
  )
}
