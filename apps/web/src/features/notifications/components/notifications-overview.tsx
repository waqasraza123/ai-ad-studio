import { NotificationBadge } from "./notification-badge"
import { getServerI18n } from "@/lib/i18n/server"
import type { NotificationRecord } from "@/server/database/types"

type NotificationsOverviewProps = {
  notifications: NotificationRecord[]
}

export async function NotificationsOverview({
  notifications
}: NotificationsOverviewProps) {
  const { formatNumber, t } = await getServerI18n()
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
        <p className="text-sm text-slate-400">{t("notifications.overview.total")}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(notifications.length)}</p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-400">{t("notifications.overview.unread")}</p>
          <NotificationBadge count={unreadCount} />
        </div>
        <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(unreadCount)}</p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">{t("notifications.overview.warnings")}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(warningCount)}</p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm text-slate-400">{t("notifications.overview.errors")}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(errorCount)}</p>
      </div>
    </section>
  )
}
