import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { updateBrandKitAction } from "@/features/brand-kits/actions/update-brand-kit"
import type { BrandKitRecord } from "@/server/database/types"

type BrandKitSettingsFormProps = {
  brandKit: BrandKitRecord
}

export function BrandKitSettingsForm({ brandKit }: BrandKitSettingsFormProps) {
  const action = updateBrandKitAction.bind(null, brandKit.id)

  return (
    <SurfaceCard className="p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
        Default brand kit
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        Theme tokens
      </h2>

      <form action={action} className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-slate-300">Brand kit name</span>
          <input
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-indigo-300/40"
            defaultValue={brandKit.name}
            name="name"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Primary color</span>
          <input className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" defaultValue={brandKit.palette.primary} name="primary" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Secondary color</span>
          <input className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" defaultValue={brandKit.palette.secondary} name="secondary" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Accent color</span>
          <input className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" defaultValue={brandKit.palette.accent} name="accent" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Background color</span>
          <input className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" defaultValue={brandKit.palette.background} name="background" />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-slate-300">Foreground color</span>
          <input className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" defaultValue={brandKit.palette.foreground} name="foreground" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Heading family</span>
          <input className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" defaultValue={brandKit.typography.heading_family} name="heading_family" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Body family</span>
          <input className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" defaultValue={brandKit.typography.body_family} name="body_family" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Headline weight</span>
          <input className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" defaultValue={brandKit.typography.headline_weight} name="headline_weight" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Body weight</span>
          <input className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" defaultValue={brandKit.typography.body_weight} name="body_weight" />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-slate-300">Letter spacing</span>
          <input className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" defaultValue={brandKit.typography.letter_spacing} name="letter_spacing" />
        </label>

        <div className="md:col-span-2">
          <FormSubmitButton pendingLabel="Saving…">Save brand kit tokens</FormSubmitButton>
        </div>
      </form>
    </SurfaceCard>
  )
}
