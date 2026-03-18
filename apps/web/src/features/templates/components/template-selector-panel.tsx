import type { AdTemplateRecord } from "@/server/database/types"
import { selectProjectTemplateAction } from "@/features/templates/actions/select-template"
import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"

type TemplateSelectorPanelProps = {
  currentTemplateId: string | null
  projectId: string
  templates: AdTemplateRecord[]
}

export function TemplateSelectorPanel({
  currentTemplateId,
  projectId,
  templates
}: TemplateSelectorPanelProps) {
  const action = selectProjectTemplateAction.bind(null, projectId)
  const currentTemplate =
    templates.find((template) => template.id === currentTemplateId) ?? templates[0] ?? null

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Creative template
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        Branded style system
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        Templates provide reusable scene packs and CTA end-card styling that shape the render output.
      </p>

      <form action={action} className="mt-6 space-y-5">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Template</span>
          <select
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
            defaultValue={currentTemplate?.id ?? ""}
            name="templateId"
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>

        {currentTemplate ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">{currentTemplate.name}</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {currentTemplate.description}
            </p>

            <div className="mt-4 grid gap-3">
              {currentTemplate.scene_pack.map((scene) => (
                <div
                  key={`${scene.purpose}-${scene.motion_style}`}
                  className="rounded-2xl border border-white/10 bg-black/10 p-3"
                >
                  <p className="text-sm font-medium text-white">{scene.purpose}</p>
                  <p className="mt-1 text-sm text-slate-300">{scene.visual_style}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                    {scene.motion_style} · {scene.caption_tone}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <Button>Save template</Button>
      </form>
    </SurfaceCard>
  )
}
