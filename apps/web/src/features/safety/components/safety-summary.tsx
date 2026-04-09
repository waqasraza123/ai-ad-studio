import { getServerI18n } from "@/lib/i18n/server"

type SafetySummaryProps = {
  riskFlags: string[]
  safetyNotes: string | null
  wasSafetyModified: boolean
}

export async function SafetySummary({
  riskFlags,
  safetyNotes,
  wasSafetyModified
}: SafetySummaryProps) {
  const { t } = await getServerI18n()

  if (!wasSafetyModified && riskFlags.length === 0 && !safetyNotes) {
    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
        {t("safety.noFlags")}
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
      <p className="text-sm font-medium text-amber-50">
        {t("safety.modified")}
      </p>

      {riskFlags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {riskFlags.map((flag) => (
            <span
              key={flag}
              className="rounded-full border border-amber-300/20 bg-black/10 px-3 py-1 text-xs text-amber-100"
            >
              {flag}
            </span>
          ))}
        </div>
      ) : null}

      {safetyNotes ? (
        <p className="text-sm leading-7 text-amber-50/90">{safetyNotes}</p>
      ) : null}
    </div>
  )
}
