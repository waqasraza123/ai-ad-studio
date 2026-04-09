import { createProjectAction } from "@/features/projects/actions/create-project"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"

type CreateProjectFormProps = {
  errorMessage?: string
}

export async function CreateProjectForm({ errorMessage }: CreateProjectFormProps) {
  const { t } = await getServerI18n()

  return (
    <SurfaceCard className="p-8">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("projects.new.eyebrow")}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">
        {t("projects.new.title")}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
        {t("projects.new.description")}
      </p>

      {errorMessage ? (
        <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      <form action={createProjectAction} className="mt-8 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">{t("projects.new.projectName")}</span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            dir="auto"
            className="theme-form-input h-12 rounded-2xl border px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
            placeholder={t("projects.new.placeholder")}
          />
        </label>

        <div className="flex items-center gap-3">
          <FormSubmitButton size="lg" pendingLabel={t("projects.new.pending")}>
            {t("projects.new.action")}
          </FormSubmitButton>
          <p className="text-sm text-slate-400">
            {t("projects.new.redirectHint")}
          </p>
        </div>
      </form>
    </SurfaceCard>
  )
}
