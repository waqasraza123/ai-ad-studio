import { saveProjectBriefAction } from "@/features/projects/actions/save-project-brief"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"
import type { ProjectInputRecord } from "@/server/database/types"

type ProjectBriefFormProps = {
  projectId: string
  projectInput: ProjectInputRecord | null
}

export async function ProjectBriefForm({
  projectId,
  projectInput
}: ProjectBriefFormProps) {
  const { t } = await getServerI18n()
  const action = saveProjectBriefAction.bind(null, projectId)

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("projects.brief.eyebrow")}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        {t("projects.brief.title")}
      </h2>

      <form action={action} className="mt-6 grid gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">{t("projects.brief.productName")}</span>
            <input
              name="productName"
              dir="auto"
              defaultValue={projectInput?.product_name ?? ""}
              className="theme-form-input h-11 rounded-2xl border px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
              placeholder={t("projects.brief.placeholder.productName")}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">{t("projects.brief.callToAction")}</span>
            <input
              name="callToAction"
              dir="auto"
              defaultValue={projectInput?.call_to_action ?? ""}
              className="theme-form-input h-11 rounded-2xl border px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
              placeholder={t("projects.brief.placeholder.callToAction")}
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">{t("projects.brief.productDescription")}</span>
          <textarea
            name="productDescription"
            dir="auto"
            defaultValue={projectInput?.product_description ?? ""}
            className="theme-form-input min-h-32 rounded-[1.5rem] border px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
            placeholder={t("projects.brief.placeholder.productDescription")}
          />
        </label>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">{t("projects.brief.offerText")}</span>
            <input
              name="offerText"
              dir="auto"
              defaultValue={projectInput?.offer_text ?? ""}
              className="theme-form-input h-11 rounded-2xl border px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
              placeholder={t("projects.brief.placeholder.offerText")}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">{t("projects.brief.targetAudience")}</span>
            <input
              name="targetAudience"
              dir="auto"
              defaultValue={projectInput?.target_audience ?? ""}
              className="theme-form-input h-11 rounded-2xl border px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
              placeholder={t("projects.brief.placeholder.targetAudience")}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">{t("projects.brief.brandTone")}</span>
            <input
              name="brandTone"
              dir="auto"
              defaultValue={projectInput?.brand_tone ?? ""}
              className="theme-form-input h-11 rounded-2xl border px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
              placeholder={t("projects.brief.placeholder.brandTone")}
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">{t("projects.brief.visualStyle")}</span>
          <input
            name="visualStyle"
            dir="auto"
            defaultValue={projectInput?.visual_style ?? ""}
            className="theme-form-input h-11 rounded-2xl border px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
            placeholder={t("projects.brief.placeholder.visualStyle")}
          />
        </label>

        <div className="pt-2">
          <FormSubmitButton pendingLabel={t("projects.brief.pending")}>
            {t("projects.brief.action")}
          </FormSubmitButton>
        </div>
      </form>
    </SurfaceCard>
  )
}
