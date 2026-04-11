import { notFound } from "next/navigation"
import { PublicPageHeader } from "@/components/i18n/public-page-header"
import { PublicPageFrame } from "@/components/layout/page-frame"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { acknowledgePublicDeliveryWorkspaceAction } from "@/features/delivery/actions/public-delivery"
import { summarizeDeliveryWorkspaceActivity } from "@/features/delivery/lib/delivery-activity"
import { getPlatformPresetLabelKey } from "@/features/renders/lib/render-ui"
import { getFormErrorMessage } from "@/lib/form-error-messages"
import { getServerI18n } from "@/lib/i18n/server"
import {
  getActiveDeliveryWorkspaceByToken,
  listAssetsForDeliveryWorkspace,
  listExportsForDeliveryWorkspace,
  listPublicDeliveryWorkspaceEventsByToken,
  listPublicDeliveryWorkspaceExportsByWorkspaceId,
  recordPublicDeliveryWorkspaceEventByToken
} from "@/server/delivery-workspaces/delivery-workspace-repository"

type PublicDeliveryPageProps = {
  params: Promise<{
    token: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function readSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key]

  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function formatTimestamp(
  formatDateTime: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string,
  value: string | null,
  pendingLabel: string
) {
  if (!value) {
    return pendingLabel
  }

  return formatDateTime(new Date(value), {
    dateStyle: "medium",
    timeStyle: "short"
  })
}

export default async function PublicDeliveryPage({
  params,
  searchParams
}: PublicDeliveryPageProps) {
  const { formatDateTime, t } = await getServerI18n()
  const { token } = await params
  const sp = await searchParams
  const formErrorMessage = getFormErrorMessage(readSearchParam(sp, "error"), t)

  const workspace = await getActiveDeliveryWorkspaceByToken(token)

  if (!workspace) {
    notFound()
  }

  try {
    await recordPublicDeliveryWorkspaceEventByToken({
      eventType: "viewed",
      token
    })
  } catch (error) {
    console.error(error)
  }

  const [workspaceExports, publicEvents] = await Promise.all([
    listPublicDeliveryWorkspaceExportsByWorkspaceId(workspace.id),
    listPublicDeliveryWorkspaceEventsByToken(token)
  ])

  const exportRecords = await listExportsForDeliveryWorkspace({
    exportIds: workspaceExports.map((item) => item.export_id)
  })
  const assets = await listAssetsForDeliveryWorkspace({
    assetIds: exportRecords
      .map((exportRecord) => exportRecord.asset_id)
      .filter((assetId): assetId is string => Boolean(assetId))
  })

  const exportsById = new Map(
    exportRecords.map((exportRecord) => [exportRecord.id, exportRecord])
  )
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]))
  const activitySummary = summarizeDeliveryWorkspaceActivity(publicEvents)
  const acknowledgeAction = acknowledgePublicDeliveryWorkspaceAction.bind(null, token)

  return (
    <main className="theme-page-shell min-h-screen text-[var(--foreground)]">
      <PublicPageHeader />
      <PublicPageFrame variant="wide" className="space-y-6">
        {formErrorMessage ? (
          <div className="rounded-[1.5rem] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {formErrorMessage}
          </div>
        ) : null}
        <section className="theme-surface-card rounded-[2rem] border p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            {t("public.delivery.eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            {workspace.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]">
            {workspace.summary}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
              <p className="text-sm text-emerald-100">{t("common.status.approved")}</p>
              <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                {workspace.approval_summary.approved_count}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-500/10 p-4">
              <p className="text-sm text-rose-100">{t("common.status.rejected")}</p>
              <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                {workspace.approval_summary.rejected_count}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-100">{t("common.status.pending")}</p>
              <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                {workspace.approval_summary.pending_count}
              </p>
            </div>

            <div className="theme-soft-panel rounded-[1.5rem] border p-4">
              <p className="text-sm text-[var(--muted-foreground)]">{t("common.status.finalized")}</p>
              <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                {formatTimestamp(formatDateTime, workspace.approval_summary.finalized_at, t("common.status.pending"))}
              </p>
            </div>
          </div>
        </section>

        <section className="theme-surface-card rounded-[2rem] border p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            {t("public.delivery.approvalSummary")}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="theme-soft-panel rounded-[1.5rem] border p-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                {t("public.delivery.reviewNote")}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">
                {workspace.approval_summary.review_note ??
                  t("public.delivery.noReviewNote")}
              </p>
            </div>

            <div className="theme-soft-panel rounded-[1.5rem] border p-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                {t("public.delivery.finalDecision")}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">
                {workspace.approval_summary.finalization_note ??
                  t("public.delivery.noFinalDecisionNote")}
              </p>
            </div>
          </div>
        </section>

        <section className="theme-surface-card rounded-[2rem] border p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            {t("public.delivery.receiptStatus")}
          </p>

          {activitySummary.acknowledgedAt ? (
            <div className="mt-4 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              {t("public.delivery.receiptAcknowledged")}{" "}
              {formatTimestamp(
                formatDateTime,
                activitySummary.acknowledgedAt,
                t("common.status.pending")
              )}
              {activitySummary.acknowledgedBy
                ? t("public.delivery.receiptAcknowledgedBy", {
                    value: activitySummary.acknowledgedBy
                  })
                : "."}
              {activitySummary.acknowledgementNote
                ? ` ${activitySummary.acknowledgementNote}`
                : ""}
            </div>
          ) : (
            <form action={acknowledgeAction} className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm text-[var(--soft-foreground)]">{t("public.delivery.recipientLabel")}</span>
                <input
                  dir="auto"
                  className="theme-form-input h-11 rounded-2xl border px-4"
                  name="actor_label"
                  placeholder={t("public.delivery.placeholder.recipient")}
                />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-[var(--soft-foreground)]">{t("public.delivery.acknowledgementNote")}</span>
                <textarea
                  dir="auto"
                  className="theme-form-input min-h-24 rounded-2xl border px-4 py-3 text-sm"
                  name="note"
                  placeholder={t("public.delivery.placeholder.note")}
                />
              </label>

              <div className="md:col-span-2">
                <FormSubmitButton
                  variant="secondary"
                  pendingLabel={t("public.delivery.acknowledgementPending")}
                  className="theme-button-secondary"
                >
                  {t("common.actions.submit")}
                </FormSubmitButton>
              </div>
            </form>
          )}
        </section>

        <section className="theme-surface-card rounded-[2rem] border p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            {t("public.delivery.handoffNotes")}
          </p>
          <p className="mt-4 text-sm leading-8 text-[var(--soft-foreground)]">
            {workspace.handoff_notes}
          </p>
        </section>

        <section className="theme-surface-card rounded-[2rem] border p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            {t("public.delivery.downloadableAssets")}
          </p>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            {workspaceExports.map((workspaceExport) => {
              const exportRecord =
                exportsById.get(workspaceExport.export_id) ?? null
              const asset = exportRecord?.asset_id
                ? (assetsById.get(exportRecord.asset_id) ?? null)
                : null
              const previewDataUrl =
                asset && typeof asset.metadata.previewDataUrl === "string"
                  ? asset.metadata.previewDataUrl
                  : exportRecord &&
                      typeof exportRecord.render_metadata.previewDataUrl ===
                        "string"
                    ? exportRecord.render_metadata.previewDataUrl
                    : null
              const isCanonical =
                exportRecord?.id === workspace.canonical_export_id

              return (
                <article
                  key={workspaceExport.id}
                  className={`overflow-hidden rounded-[2rem] border p-4 ${
                    isCanonical
                      ? "border-emerald-400/30 bg-emerald-500/10"
                      : "theme-soft-panel"
                  }`}
                >
                  {previewDataUrl ? (
                    <img
                      alt={workspaceExport.label}
                      className="h-72 w-full rounded-[1.5rem] object-cover"
                      decoding="async"
                      loading="lazy"
                      src={previewDataUrl}
                    />
                  ) : (
                    <div className="theme-soft-panel flex h-72 items-center justify-center rounded-[1.5rem] border text-sm text-[var(--muted-foreground)]">
                      {t("public.showcase.previewUnavailable")}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="theme-soft-panel rounded-full border px-3 py-1 text-xs text-[var(--soft-foreground)]">
                      {workspaceExport.label}
                    </span>
                    {exportRecord ? (
                      <>
                        <span className="theme-soft-panel rounded-full border px-3 py-1 text-xs text-[var(--soft-foreground)]">
                          {t(getPlatformPresetLabelKey(exportRecord.platform_preset))}
                        </span>
                        {isCanonical ? (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                            {t("public.delivery.canonical")}
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {exportRecord ? (
                      <a
                        className="theme-runtime-secondary-button inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition"
                        href={`/delivery/${token}/download/${exportRecord.id}`}
                      >
                        {t("public.delivery.downloadAsset")}
                      </a>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </PublicPageFrame>
    </main>
  )
}
