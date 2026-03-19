import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import {
  archiveShareCampaignAction,
  publishShareCampaignAction
} from "@/features/renders/actions/manage-share-campaign"
import type { ShareCampaignRecord } from "@/server/database/types"

type ShareCampaignPanelProps = {
  eligibilityReason: string | null
  exportId: string
  isEligible: boolean
  shareCampaign: ShareCampaignRecord | null
}

export function ShareCampaignPanel({
  eligibilityReason,
  exportId,
  isEligible,
  shareCampaign
}: ShareCampaignPanelProps) {
  const publishAction = publishShareCampaignAction.bind(null, exportId)
  const archiveAction = archiveShareCampaignAction.bind(null, exportId)
  const isActive = shareCampaign?.status === "active"

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Share campaign
      </p>

      <div className="mt-4 space-y-4">
        {!isEligible ? (
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {eligibilityReason ?? "Only reviewed winners can be promoted publicly."}
          </div>
        ) : isActive ? (
          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            This reviewed winner has an active public share campaign.
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
            Create a public campaign page for this reviewed winner.
          </div>
        )}

        {isEligible && !isActive ? (
          <form action={publishAction} className="space-y-4">
            <input
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
              name="title"
              placeholder="Campaign title"
            />
            <textarea
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
              name="message"
              placeholder="Campaign message"
            />
            <Button>Create share campaign</Button>
          </form>
        ) : null}

        {isEligible && isActive && shareCampaign ? (
          <div className="space-y-4">
            <a
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
              href={`/campaign/${shareCampaign.token}`}
            >
              Open public campaign
            </a>
            <form action={archiveAction}>
              <Button variant="secondary">Archive share campaign</Button>
            </form>
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  )
}
