import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { updateOwnerGuardrailsAction } from "@/features/settings/actions/update-owner-guardrails"
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
        Personal safety caps
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        Personal budget and concurrency caps
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        These caps can only tighten the limits from your active subscription. They
        cannot raise plan entitlements above what Billing and plan allows.
      </p>

      <form action={updateOwnerGuardrailsAction} className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Monthly total budget</span>
          <input
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white"
            defaultValue={guardrails.monthly_total_budget_usd}
            inputMode="decimal"
            min="0"
            name="monthly_total_budget_usd"
            step="0.01"
          />
          <span className="text-xs text-slate-500">
            Current default {formatCurrency(guardrails.monthly_total_budget_usd)}
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Monthly OpenAI budget</span>
          <input
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white"
            defaultValue={guardrails.monthly_openai_budget_usd}
            inputMode="decimal"
            min="0"
            name="monthly_openai_budget_usd"
            step="0.01"
          />
          <span className="text-xs text-slate-500">
            Current default {formatCurrency(guardrails.monthly_openai_budget_usd)}
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Monthly Runway budget</span>
          <input
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white"
            defaultValue={guardrails.monthly_runway_budget_usd}
            inputMode="decimal"
            min="0"
            name="monthly_runway_budget_usd"
            step="0.01"
          />
          <span className="text-xs text-slate-500">
            Current default {formatCurrency(guardrails.monthly_runway_budget_usd)}
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Concurrent render jobs</span>
          <input
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white"
            defaultValue={guardrails.max_concurrent_render_jobs}
            inputMode="numeric"
            min="1"
            name="max_concurrent_render_jobs"
            step="1"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Concurrent preview jobs</span>
          <input
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white"
            defaultValue={guardrails.max_concurrent_preview_jobs}
            inputMode="numeric"
            min="1"
            name="max_concurrent_preview_jobs"
            step="1"
          />
        </label>

        <label className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3 xl:self-end">
          <input
            className="h-4 w-4 rounded border-white/10 bg-white/[0.04]"
            defaultChecked={guardrails.auto_block_on_budget}
            name="auto_block_on_budget"
            type="checkbox"
          />
          <span className="text-sm text-slate-300">Auto-block jobs that exceed budget</span>
        </label>

        <div className="md:col-span-2 xl:col-span-3">
          <FormSubmitButton pendingLabel="Saving…">
            Save guardrails
          </FormSubmitButton>
        </div>
      </form>
    </SurfaceCard>
  )
}
