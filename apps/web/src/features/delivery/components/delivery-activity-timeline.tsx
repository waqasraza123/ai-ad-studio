import type { DeliveryWorkspaceEventRecord } from "@/server/database/types"
import type { DeliveryWorkspaceActivitySummary } from "@/features/delivery/lib/delivery-activity"
import { getServerI18n } from "@/lib/i18n/server"
import type { Translator } from "@/lib/i18n/translator"

type DeliveryActivityTimelineProps = {
  events: DeliveryWorkspaceEventRecord[]
  summary: DeliveryWorkspaceActivitySummary
}

function formatTimestamp(
  value: string | null,
  formatDateTime: Translator["formatDateTime"],
  notSetLabel: string
) {
  if (!value) {
    return notSetLabel
  }

  return formatDateTime(value, {
    dateStyle: "medium",
    timeStyle: "short"
  })
}

function eventLabel(
  eventType: DeliveryWorkspaceEventRecord["event_type"],
  t: Translator["t"]
) {
  if (eventType === "delivered") {
    return t("delivery.activity.delivered")
  }

  if (eventType === "viewed") {
    return t("delivery.activity.viewed")
  }

  if (eventType === "downloaded") {
    return t("delivery.activity.downloaded")
  }

  return t("delivery.activity.acknowledged")
}

function readEventNote(event: DeliveryWorkspaceEventRecord) {
  const value = event.metadata.note
  return typeof value === "string" && value.trim().length > 0 ? value : null
}

export async function DeliveryActivityTimeline({
  events,
  summary
}: DeliveryActivityTimelineProps) {
  const { formatDateTime, t } = await getServerI18n()
  const notSetLabel = t("common.words.notSet")

  return (
    <section className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          {t("delivery.activity.eyebrow")}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
          {t("delivery.activity.title")}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-100">{t("delivery.activity.delivered")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatTimestamp(summary.deliveredAt, formatDateTime, notSetLabel)}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("delivery.activity.lastViewed")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatTimestamp(summary.lastViewedAt, formatDateTime, notSetLabel)}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">{t("delivery.activity.downloads")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {summary.downloadCount}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            {t("delivery.activity.last", {
              value: formatTimestamp(
                summary.lastDownloadedAt,
                formatDateTime,
                notSetLabel
              )
            })}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-indigo-400/20 bg-indigo-500/10 p-4">
          <p className="text-sm text-indigo-100">{t("delivery.activity.acknowledged")}</p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatTimestamp(summary.acknowledgedAt, formatDateTime, notSetLabel)}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            {summary.acknowledgedBy ?? t("delivery.activity.noRecipientLabel")}
          </p>
        </div>
      </div>

      {summary.acknowledgementNote ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">
            {t("delivery.activity.latestAcknowledgementNote")}
          </p>
          <p className="mt-2 text-sm leading-7 text-white">
            {summary.acknowledgementNote}
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            {t("delivery.activity.empty")}
          </div>
        ) : (
          events.map((event) => {
            const eventNote = readEventNote(event)

            return (
              <div
                key={event.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                    {eventLabel(event.event_type, t)}
                  </span>
                  {event.export_id ? (
                    <span className="theme-bidi-isolate rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                      {event.export_id}
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-sm text-slate-300">
                  {event.actor_label ?? t("delivery.activity.anonymousRecipient")}
                </p>

                {eventNote ? (
                  <p className="mt-3 text-sm leading-7 text-white">{eventNote}</p>
                ) : null}

                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {formatTimestamp(event.created_at, formatDateTime, notSetLabel)}
                </p>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
