import { AppPageFrame, PageIntro } from "@/components/layout/page-frame"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { CreateProjectForm } from "@/features/projects/components/create-project-form"
import { getFormErrorMessage } from "@/lib/form-error-messages"
import { getServerI18n } from "@/lib/i18n/server"

type NewProjectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function readSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key]

  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export default async function NewProjectPage({
  searchParams
}: NewProjectPageProps) {
  const params = await searchParams
  const { t } = await getServerI18n()
  const errorMessage = getFormErrorMessage(readSearchParam(params, "error"))

  return (
    <AppPageFrame variant="expanded" className="space-y-6">
      <SurfaceCard className="p-6 lg:p-8">
        <PageIntro
          eyebrow={t("projects.new.eyebrow")}
          title={t("projects.new.title")}
          description={t("projects.new.description")}
        />
      </SurfaceCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <CreateProjectForm errorMessage={errorMessage ?? undefined} />

        <SurfaceCard className="p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            {t("projects.new.nextEyebrow")}
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
            {t("projects.new.nextTitle")}
          </h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-medium text-white">{t("projects.new.stepOneTitle")}</p>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {t("projects.new.stepOneDescription")}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-medium text-white">{t("projects.new.stepTwoTitle")}</p>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {t("projects.new.stepTwoDescription")}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-medium text-white">{t("projects.new.stepThreeTitle")}</p>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {t("projects.new.stepThreeDescription")}
              </p>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </AppPageFrame>
  )
}
