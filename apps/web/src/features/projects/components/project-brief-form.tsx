import { saveProjectBriefAction } from "@/features/projects/actions/save-project-brief"
import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import type { ProjectInputRecord } from "@/server/database/types"

type ProjectBriefFormProps = {
  projectId: string
  projectInput: ProjectInputRecord | null
}

export function ProjectBriefForm({
  projectId,
  projectInput
}: ProjectBriefFormProps) {
  const action = saveProjectBriefAction.bind(null, projectId)

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Project brief
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        Persist the inputs that will drive concept generation
      </h2>

      <form action={action} className="mt-6 grid gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Product name</span>
            <input
              name="productName"
              defaultValue={projectInput?.product_name ?? ""}
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-300/40"
              placeholder="HydraGlow Serum"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Call to action</span>
            <input
              name="callToAction"
              defaultValue={projectInput?.call_to_action ?? ""}
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-300/40"
              placeholder="Shop now"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Product description</span>
          <textarea
            name="productDescription"
            defaultValue={projectInput?.product_description ?? ""}
            className="min-h-32 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-300/40"
            placeholder="Describe the product clearly so the concept pipeline can build hooks, angles, and visual direction later."
          />
        </label>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Offer text</span>
            <input
              name="offerText"
              defaultValue={projectInput?.offer_text ?? ""}
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-300/40"
              placeholder="20 percent off launch week"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Target audience</span>
            <input
              name="targetAudience"
              defaultValue={projectInput?.target_audience ?? ""}
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-300/40"
              placeholder="Skincare buyers 22 to 35"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Brand tone</span>
            <input
              name="brandTone"
              defaultValue={projectInput?.brand_tone ?? ""}
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-300/40"
              placeholder="Premium and clean"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Visual style</span>
          <input
            name="visualStyle"
            defaultValue={projectInput?.visual_style ?? ""}
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-300/40"
            placeholder="Minimal studio lighting with soft luxury feel"
          />
        </label>

        <div className="pt-2">
          <Button>Save brief</Button>
        </div>
      </form>
    </SurfaceCard>
  )
}
