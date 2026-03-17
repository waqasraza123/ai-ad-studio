import { SurfaceCard } from "@/components/primitives/surface-card"

type ConfigurationRequiredProps = {
  title: string
  description: string
}

export function ConfigurationRequired({
  description,
  title
}: ConfigurationRequiredProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
      <SurfaceCard className="w-full p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          Configuration required
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">
          {title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-400">{description}</p>
        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-300">
            Add Supabase values to your local environment before proving auth end
            to end:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ul>
        </div>
      </SurfaceCard>
    </div>
  )
}
