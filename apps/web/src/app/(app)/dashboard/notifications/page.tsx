import { markAllNotificationsReadAction } from "@/features/notifications/actions/mark-notification-read"
import { NotificationList } from "@/features/notifications/components/notification-list"
import { NotificationsOverview } from "@/features/notifications/components/notifications-overview"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { listNotificationsByOwner } from "@/server/notifications/notification-repository"
import { Button } from "@/components/primitives/button"

export default async function NotificationsPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const notifications = await listNotificationsByOwner(user.id)
  const unreadCount = notifications.filter((notification) => !notification.read_at).length

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Notifications
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
              Alerts for exports, failures, and queue health
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Track completed exports, failed jobs, and long-running queue conditions in one place.
            </p>
          </div>

          {unreadCount > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <Button variant="secondary">Mark all as read</Button>
            </form>
          ) : null}
        </div>
      </section>

      <NotificationsOverview notifications={notifications} />
      <NotificationList notifications={notifications} />
    </div>
  )
}
