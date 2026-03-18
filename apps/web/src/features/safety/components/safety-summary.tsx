type SafetySummaryProps = {
  riskFlags: string[]
  safetyNotes: string | null
  wasSafetyModified: boolean
}

export function SafetySummary({
  riskFlags,
  safetyNotes,
  wasSafetyModified
}: SafetySummaryProps) {
  if (!wasSafetyModified && riskFlags.length === 0 && !safetyNotes) {
    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
        Safety review passed with no modifications.
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
      <p className="text-sm font-medium text-amber-50">
        Safety review adjusted or flagged this concept.
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
