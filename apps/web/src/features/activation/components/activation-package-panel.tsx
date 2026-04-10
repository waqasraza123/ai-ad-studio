import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { createActivationPackageAction } from "@/features/activation/actions/create-activation-package"
import { getServerI18n } from "@/lib/i18n/server"
import type { ActivationReadinessAssessment } from "@/server/activation/activation-service"
import type { ActivationPackageRecord, ActivationChannel } from "@/server/database/types"

const channels: ActivationChannel[] = [
  "meta",
  "google",
  "tiktok",
  "internal_handoff"
]

type ActivationPackagePanelProps = {
  activationEnabled: boolean
  exportId: string
  packages: ActivationPackageRecord[]
  readiness: ActivationReadinessAssessment
}

function channelMessageKey(channel: ActivationChannel) {
  if (channel === "meta") return "activation.channel.meta" as const
  if (channel === "google") return "activation.channel.google" as const
  if (channel === "tiktok") return "activation.channel.tiktok" as const
  return "activation.channel.internalHandoff" as const
}

function issueMessageKey(issue: string) {
  if (issue === "canonical_export_missing") return "activation.issue.canonicalExportMissing" as const
  if (issue === "export_asset_missing") return "activation.issue.exportAssetMissing" as const
  if (issue === "export_not_canonical") return "activation.issue.exportNotCanonical" as const
  if (issue === "export_not_ready") return "activation.issue.exportNotReady" as const
  if (issue === "export_not_finalized") return "activation.issue.exportNotFinalized" as const
  if (issue === "project_missing") return "activation.issue.projectMissing" as const
  if (issue === "render_batch_missing") return "activation.issue.renderBatchMissing" as const
  return "activation.issue.renderBatchNotFinalized" as const
}

function readAssetCount(record: ActivationPackageRecord) {
  const items = record.asset_bundle_json.items
  return Array.isArray(items) ? items.length : 0
}

function readPlacementCount(record: ActivationPackageRecord) {
  const adCreative =
    typeof record.channel_payload_json.adCreative === "object" &&
    record.channel_payload_json.adCreative
      ? record.channel_payload_json.adCreative
      : null
  const placements = adCreative && "placements" in adCreative ? adCreative.placements : null
  return Array.isArray(placements) ? placements.length : 0
}

export async function ActivationPackagePanel({
  activationEnabled,
  exportId,
  packages,
  readiness
}: ActivationPackagePanelProps) {
  const { formatDateTime, t } = await getServerI18n()
  const sortedPackages = [...packages].sort((left, right) =>
    right.created_at.localeCompare(left.created_at)
  )
  const currentPackageIds = new Set<string>()
  const seenChannels = new Set<ActivationChannel>()

  for (const activationPackage of sortedPackages) {
    if (activationPackage.status !== "superseded" && !seenChannels.has(activationPackage.channel)) {
      seenChannels.add(activationPackage.channel)
      currentPackageIds.add(activationPackage.id)
    }
  }

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("activation.panel.eyebrow")}
      </p>

      <div className="mt-4 space-y-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
          {t("activation.panel.description")}
        </div>

        {!activationEnabled ? (
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {t("activation.panel.upgradeRequired")}
          </div>
        ) : null}

        <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            {t("activation.panel.readinessCheck")}
          </p>
          <div
            className={
              readiness.status === "ready"
                ? "mt-3 rounded-[1rem] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100"
                : "mt-3 rounded-[1rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100"
            }
          >
            <p>
              {readiness.status === "ready"
                ? t("activation.panel.readySummary")
                : t("activation.panel.blockedSummary")}
            </p>

            {readiness.issues.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm">
                {readiness.issues.map((issue) => (
                  <li key={issue}>{t(issueMessageKey(issue))}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        {activationEnabled && readiness.isEligible ? (
          <div className="grid gap-3 md:grid-cols-2">
            {channels.map((channel) => (
              <form
                key={channel}
                action={createActivationPackageAction.bind(null, exportId)}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
              >
                <input name="channel" type="hidden" value={channel} />
                <p className="text-sm font-medium text-white">
                  {t(channelMessageKey(channel))}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {t("activation.panel.channelDescription")}
                </p>
                <div className="mt-4">
                  <FormSubmitButton
                    className="w-full justify-center"
                    pendingLabel={t("activation.panel.pending")}
                  >
                    {t("activation.panel.prepareAction", {
                      value: t(channelMessageKey(channel))
                    })}
                  </FormSubmitButton>
                </div>
              </form>
            ))}
          </div>
        ) : activationEnabled ? (
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {t("activation.panel.ineligible")}
          </div>
        ) : null}

        {sortedPackages.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">
                {t("activation.panel.history")}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {t("activation.panel.historySummary", {
                  count: sortedPackages.length
                })}
              </p>
            </div>
            {sortedPackages.map((activationPackage) => (
              <div
                key={activationPackage.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {t(channelMessageKey(activationPackage.channel))}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(activationPackage.created_at, {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {currentPackageIds.has(activationPackage.id) ? (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-emerald-100">
                        {t("activation.panel.currentPackage")}
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-slate-200">
                        {t("activation.panel.historyEntry")}
                      </span>
                    )}
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-slate-200">
                      {t(
                        activationPackage.readiness_status === "ready"
                          ? "activation.panel.readiness.ready"
                          : "activation.panel.readiness.blocked"
                      )}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-slate-200">
                      {t(
                        activationPackage.status === "ready"
                          ? "activation.panel.status.ready"
                          : activationPackage.status === "draft"
                            ? "activation.panel.status.draft"
                            : activationPackage.status === "superseded"
                              ? "activation.panel.status.superseded"
                              : "activation.panel.status.archived"
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                    {t("activation.panel.assetCount", {
                      count: readAssetCount(activationPackage)
                    })}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                    {t("activation.panel.placementCount", {
                      count: readPlacementCount(activationPackage)
                    })}
                  </span>
                </div>

                {activationPackage.readiness_issues.length > 0 ? (
                  <div className="mt-3 rounded-[1rem] border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-100">
                    <ul className="space-y-2">
                      {activationPackage.readiness_issues.map((issue) => (
                        <li key={issue}>
                          {t(issueMessageKey(issue))}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                    href={`/api/activation-packages/${activationPackage.id}/manifest`}
                  >
                    {t("activation.panel.downloadManifest")}
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            {t("activation.panel.empty")}
          </div>
        )}
      </div>
    </SurfaceCard>
  )
}
