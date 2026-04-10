import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import {
  archiveShareCampaignAction,
  publishShareCampaignAction
} from "@/features/renders/actions/manage-share-campaign"
import type { AppMessageKey } from "@/lib/i18n/messages/en"
import { getServerI18n } from "@/lib/i18n/server"
import type { ShareCampaignRecord } from "@/server/database/types"

type ShareCampaignPanelProps = {
  eligibilityReason: AppMessageKey | null
  exportId: string
  isEligible: boolean
  shareCampaign: ShareCampaignRecord | null
}

export async function ShareCampaignPanel({
  eligibilityReason,
  exportId,
  isEligible,
  shareCampaign
}: ShareCampaignPanelProps) {
  const { t } = await getServerI18n()
  const publishAction = publishShareCampaignAction.bind(null, exportId)
  const archiveAction = archiveShareCampaignAction.bind(null, exportId)
  const isActive = shareCampaign?.status === "active"

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("campaigns.panel.eyebrow")}
      </p>

      <div className="mt-4 space-y-4">
        {!isEligible ? (
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {eligibilityReason ? t(eligibilityReason) : t("campaigns.panel.ineligible")}
          </div>
        ) : isActive ? (
          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            {t("campaigns.panel.active")}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
            {t("campaigns.panel.ready")}
          </div>
        )}

        {isEligible && !isActive ? (
          <form action={publishAction} className="space-y-4">
            <input
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
              name="title"
              placeholder={t("campaigns.panel.titlePlaceholder")}
            />
            <textarea
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              name="message"
              placeholder={t("campaigns.panel.messagePlaceholder")}
            />
            <FormSubmitButton pendingLabel={t("campaigns.panel.pending")}>
              {t("campaigns.panel.create")}
            </FormSubmitButton>
          </form>
        ) : null}

        {isEligible && isActive && shareCampaign ? (
          <div className="space-y-4">
            <a
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
              href={`/campaign/${shareCampaign.token}`}
            >
              {t("campaigns.panel.open")}
            </a>
            <form action={archiveAction}>
              <FormSubmitButton
                variant="secondary"
                pendingLabel={t("campaigns.panel.archivePending")}
              >
                {t("campaigns.panel.archive")}
              </FormSubmitButton>
            </form>
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  )
}
