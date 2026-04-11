import { generateConceptsAction } from "@/features/concepts/actions/generate-concepts"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"
import type { AppMessageKey } from "@/lib/i18n/messages/en"

type GenerateConceptsPanelProps = {
  descriptionKey: AppMessageKey
  labelKey: AppMessageKey
  projectId: string
  status: "failed" | "idle" | "queued" | "ready" | "running" | "waiting"
}

export async function GenerateConceptsPanel({
  descriptionKey,
  labelKey,
  projectId,
  status
}: GenerateConceptsPanelProps) {
  const { t } = await getServerI18n()
  const action = generateConceptsAction.bind(null, projectId)
  const isBlocked = status === "queued" || status === "running"

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {t("concepts.panel.generationEyebrow")}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          {t("concepts.panel.generationTitle")}
        </h2>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
          {t(labelKey)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-400">{t(descriptionKey)}</p>

      <form action={action} className="mt-6">
        <FormSubmitButton
          disabled={isBlocked}
          pendingLabel={t("concepts.panel.generationPending")}
        >
          {isBlocked
            ? t("concepts.panel.generationInProgress")
            : t("concepts.panel.generationAction")}
        </FormSubmitButton>
      </form>
    </SurfaceCard>
  )
}
