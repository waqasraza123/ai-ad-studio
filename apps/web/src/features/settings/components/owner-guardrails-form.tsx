import { SurfaceCard } from "@/components/primitives/surface-card"
import type { OwnerGuardrailsRecord } from "@/server/database/types"

type OwnerGuardrailsFormProps = {
  guardrails: OwnerGuardrailsRecord
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`
}

export function OwnerGuardrailsForm({
  guardrails
}: OwnerGuardrailsFormProps) {
  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Guardrails
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        Budget and concurrency defaults
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        Current owner-level limits used by the pipeline to keep generation and render usage under control.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Monthly total budget</p>
          <p className="mt-2 text-lg font-medium text-white">
            {formatCurrency(guardrails.monthly_total_budget_usd)}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Monthly OpenAI budget</p>
          <p className="mt-2 text-lg font-medium text-white">
            {formatCurrency(guardrails.monthly_openai_budget_usd)}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Monthly Runway budget</p>
          <p className="mt-2 text-lg font-medium text-white">
            {formatCurrency(guardrails.monthly_runway_budget_usd)}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Concurrent render jobs</p>
          <p className="mt-2 text-lg font-medium text-white">
            {guardrails.max_concurrent_render_jobs}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Concurrent preview jobs</p>
          <p className="mt-2 text-lg font-medium text-white">
            {guardrails.max_concurrent_preview_jobs}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Auto block on budget</p>
          <p className="mt-2 text-lg font-medium text-white">
            {guardrails.auto_block_on_budget ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>
    </SurfaceCard>
  )
}
