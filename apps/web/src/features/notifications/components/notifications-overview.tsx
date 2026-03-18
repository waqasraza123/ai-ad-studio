import { NotificationBadge } from "./notification-badge"
import type { NotificationRecord } from "@/server/database/types"

type NotificationsOverviewProps = {
  notifications: NotificationRecord[]
}

export function NotificationsOverview({
  notifications
}: NotificationsOverviewProps) {
  const unreadCount = notifications.filter((notification) => !notification.read_at).length
  const errorCount = notifications.filter(
    (notification) => notification.severity === "error"
  ).length
  const warningCount = notifications.filter(
    (notification) => notification.severity === "warning"
  ).length

  return (
    <section className="grid gap-4 md:grid-cols-4">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">Total notifications</p>
        <p className="mt-2 text-2xl font-semibold text-white">{notifications.length}</p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-400">Unread</p>
          <NotificationBadge count={unreadCount} />
        </div>
        <p className="mt-2 text-2xl font-semibold text-white">{unreadCount}</p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">Warnings</p>
        <p className="mt-2 text-2xl font-semibold text-white">{warningCount}</p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">Errors</p>
        <p className="mt-2 text-2xl font-semibold text-white">{errorCount}</p>
      </div>
    </section>
  )
}
