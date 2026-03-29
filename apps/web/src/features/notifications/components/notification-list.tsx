import Link from "next/link"
import { markNotificationReadAction } from "@/features/notifications/actions/mark-notification-read"
import type { NotificationRecord } from "@/server/database/types"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"

type NotificationListProps = {
  notifications: NotificationRecord[]
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value))
}

function severityClasses(severity: NotificationRecord["severity"]) {
  if (severity === "success") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
  }

  if (severity === "warning") {
    return "border-amber-400/20 bg-amber-500/10 text-amber-100"
  }

  if (severity === "error") {
    return "border-rose-400/20 bg-rose-500/10 text-rose-100"
  }

  return "border-white/10 bg-white/[0.05] text-slate-300"
}

export function NotificationList({ notifications }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-sm text-slate-400">
        No notifications yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const markReadAction = markNotificationReadAction.bind(null, notification.id)

        return (
          <div
            key={notification.id}
            className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-white">{notification.title}</p>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${severityClasses(notification.severity)}`}
                  >
                    {notification.severity}
                  </span>
                  {notification.read_at ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                      read
                    </span>
                  ) : (
                    <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                      unread
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {notification.body}
                </p>

                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {formatTimestamp(notification.created_at)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {notification.action_url ? (
                  <Link
                    href={notification.action_url}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                  >
                    Open
                  </Link>
                ) : null}

                {!notification.read_at ? (
                  <form action={markReadAction}>
                    <FormSubmitButton variant="secondary" pendingLabel="Updating…">
                      Mark as read
                    </FormSubmitButton>
                  </form>
                ) : null}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
