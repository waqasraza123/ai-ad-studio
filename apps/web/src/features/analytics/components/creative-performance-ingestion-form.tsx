"use client"

import { useRef, useState } from "react"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { submitCreativePerformanceAction } from "@/features/analytics/actions/submit-creative-performance"
import { cn } from "@/lib/utils"

type CreativePerformanceExportOption = {
  id: string
  label: string
}

type CreativePerformanceIngestionLabels = {
  accountLabel: string
  addRow: string
  clicks: string
  channelLabels: Record<"google" | "internal_handoff" | "meta" | "tiktok", string>
  conversionValue: string
  conversions: string
  impressions: string
  metricDate: string
  notes: string
  pending: string
  removeRow: string
  rowLabelPrefix: string
  rowsDescription: string
  rowsTitle: string
  sharedContext: string
  spend: string
  submit: string
}

type IngestionRowState = {
  channel: "google" | "internal_handoff" | "meta" | "tiktok"
  id: string
}

type CreativePerformanceIngestionFormProps = {
  exportOptions: CreativePerformanceExportOption[]
  labels: CreativePerformanceIngestionLabels
}

const channels = ["meta", "google", "tiktok", "internal_handoff"] as const

export function CreativePerformanceIngestionForm({
  exportOptions,
  labels
}: CreativePerformanceIngestionFormProps) {
  const nextRowId = useRef(2)
  const [rows, setRows] = useState<IngestionRowState[]>([
    {
      channel: "meta",
      id: "row-1"
    }
  ])

  function createRow() {
    const row = {
      channel: "meta",
      id: `row-${nextRowId.current}`
    } satisfies IngestionRowState

    nextRowId.current += 1
    return row
  }

  return (
    <form action={submitCreativePerformanceAction} className="space-y-4">
      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          {labels.sharedContext}
        </p>

        <div className="mt-3 grid gap-3">
          <input
            className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
            name="external_account_label"
            placeholder={labels.accountLabel}
          />

          <textarea
            className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/40"
            name="notes"
            placeholder={labels.notes}
          />
        </div>
      </div>

      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              {labels.rowsTitle}
            </p>
            <p className="mt-2 text-sm text-slate-400">{labels.rowsDescription}</p>
          </div>

          <button
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 text-sm font-medium text-white transition hover:bg-white/[0.1]"
            onClick={() => setRows((current) => [...current, createRow()])}
            type="button"
          >
            {labels.addRow}
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {rows.map((row, index) => (
            <section
              key={row.id}
              className="rounded-[1.25rem] border border-white/10 bg-slate-950/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-white">
                  {`${labels.rowLabelPrefix} ${index + 1}`}
                </p>

                <button
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm transition",
                    rows.length > 1
                      ? "border-white/10 bg-white/[0.05] text-slate-200 hover:bg-white/[0.08]"
                      : "cursor-not-allowed border-white/5 bg-white/[0.02] text-slate-500"
                  )}
                  disabled={rows.length === 1}
                  onClick={() =>
                    setRows((current) => current.filter((currentRow) => currentRow.id !== row.id))
                  }
                  type="button"
                >
                  {labels.removeRow}
                </button>
              </div>

              <input name="activation_package_id" type="hidden" value="" />

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <select
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                  defaultValue={exportOptions[0]?.id ?? ""}
                  name="row_export_id"
                >
                  {exportOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                  defaultValue={row.channel}
                  name="row_channel"
                >
                  {channels.map((channel) => (
                    <option key={channel} value={channel}>
                      {labels.channelLabels[channel]}
                    </option>
                  ))}
                </select>

                <input
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                  name="row_metric_date"
                  placeholder={labels.metricDate}
                  type="date"
                />

                <input
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                  min="0"
                  name="row_impressions"
                  placeholder={labels.impressions}
                  step="1"
                  type="number"
                />

                <input
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                  min="0"
                  name="row_clicks"
                  placeholder={labels.clicks}
                  step="1"
                  type="number"
                />

                <input
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                  min="0"
                  name="row_spend_usd"
                  placeholder={labels.spend}
                  step="0.01"
                  type="number"
                />

                <input
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                  min="0"
                  name="row_conversions"
                  placeholder={labels.conversions}
                  step="1"
                  type="number"
                />

                <input
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-indigo-300/40"
                  min="0"
                  name="row_conversion_value_usd"
                  placeholder={labels.conversionValue}
                  step="0.01"
                  type="number"
                />
              </div>
            </section>
          ))}
        </div>
      </div>

      <FormSubmitButton
        className="w-full justify-center"
        pendingLabel={labels.pending}
      >
        {labels.submit}
      </FormSubmitButton>
    </form>
  )
}
