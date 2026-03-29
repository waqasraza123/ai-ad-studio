export function DashboardRouteSkeleton() {
  return (
    <div
      className="space-y-6 animate-pulse"
      aria-busy
      aria-label="Loading workspace"
    >
      <div className="h-9 w-56 max-w-[70%] rounded-full bg-white/10" />
      <div className="h-4 w-full max-w-xl rounded-full bg-white/[0.06]" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-44 rounded-[1.75rem] bg-white/[0.06]" />
        <div className="h-44 rounded-[1.75rem] bg-white/[0.06]" />
      </div>
      <div className="h-72 rounded-[1.75rem] bg-white/[0.05]" />
    </div>
  )
}
