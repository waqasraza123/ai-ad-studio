type NotificationBadgeProps = {
  count: number
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count <= 0) {
    return null
  }

  return (
    <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-100">
      {count}
    </span>
  )
}
