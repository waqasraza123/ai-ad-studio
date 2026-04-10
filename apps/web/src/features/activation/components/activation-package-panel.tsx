import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { createActivationPackageAction } from "@/features/activation/actions/create-activation-package"
import { getServerI18n } from "@/lib/i18n/server"
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
  isEligible: boolean
  packages: ActivationPackageRecord[]
}

function channelMessageKey(channel: ActivationChannel) {
  if (channel === "meta") return "activation.channel.meta" as const
  if (channel === "google") return "activation.channel.google" as const
  if (channel === "tiktok") return "activation.channel.tiktok" as const
  return "activation.channel.internalHandoff" as const
}

export async function ActivationPackagePanel({
  activationEnabled,
  exportId,
  isEligible,
  packages
}: ActivationPackagePanelProps) {
  const { formatDateTime, t } = await getServerI18n()

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

        {activationEnabled && !isEligible ? (
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {t("activation.panel.ineligible")}
          </div>
        ) : null}

        {activationEnabled && isEligible ? (
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
        ) : null}

        {packages.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-white">
              {t("activation.panel.history")}
            </p>
            {packages.map((activationPackage) => (
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

                {activationPackage.readiness_issues.length > 0 ? (
                  <div className="mt-3 rounded-[1rem] border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-100">
                    {activationPackage.readiness_issues.join(", ")}
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
