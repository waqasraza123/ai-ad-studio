import Link from "next/link"
import { getServerI18n } from "@/lib/i18n/server"
import { getShareCampaignStatusLabelKey } from "@/features/renders/lib/render-ui"
import type {
  ProjectRecord,
  ShareCampaignRecord
} from "@/server/database/types"

type ShareCampaignListProps = {
  campaigns: ShareCampaignRecord[]
  projectsById: Map<string, ProjectRecord>
}

function statusClasses(status: ShareCampaignRecord["status"]) {
  if (status === "active") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
  }

  return "border-white/10 bg-white/[0.05] text-slate-300"
}

export async function ShareCampaignList({
  campaigns,
  projectsById
}: ShareCampaignListProps) {
  const { formatDateTime, t } = await getServerI18n()
  if (campaigns.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
        {t("campaigns.list.empty")}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {campaigns.map((campaign) => {
        const project = projectsById.get(campaign.project_id) ?? null

        return (
          <div
            key={campaign.id}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-white">{campaign.title}</p>
                  <span className={`rounded-full border px-3 py-1 text-xs ${statusClasses(campaign.status)}`}>
                    {t(getShareCampaignStatusLabelKey(campaign.status))}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  {project?.name ?? t("campaigns.list.unknownProject")}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{campaign.message}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {formatDateTime(campaign.created_at, {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/campaign/${campaign.token}`}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                >
                  {t("campaigns.list.openPublicPage")}
                </Link>
                <Link
                  href={`/dashboard/exports/${campaign.export_id}`}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                >
                  {t("campaigns.list.openExport")}
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
