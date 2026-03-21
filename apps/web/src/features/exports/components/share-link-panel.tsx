import { createShareLinkAction } from "@/features/exports/actions/create-share-link"
import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"

type ShareLinkPanelProps = {
  exportId: string
  shareUrl: string | null
}

export function ShareLinkPanel({
  exportId,
  shareUrl
}: ShareLinkPanelProps) {
  const action = createShareLinkAction.bind(null, exportId)

  return (
    <SurfaceCard className="p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Share link
      </p>

      <div className="mt-4 space-y-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
          Share links are owner-controlled utility links for a single export.
          They are separate from winner-only campaign pages and finalized delivery workspaces.
        </div>

        {shareUrl ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="break-all text-sm text-slate-300">{shareUrl}</p>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            No share link yet. Create one to share this single export outside the main campaign and delivery flow.
          </div>
        )}

        <form action={action}>
          <Button>
            {shareUrl ? "Reuse utility share link" : "Create utility share link"}
          </Button>
        </form>
      </div>
    </SurfaceCard>
  )
}
