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
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
          Configuration required
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
          {title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">{description}</p>
        <div className="theme-soft-panel mt-8 rounded-[1.5rem] border p-4">
          <p className="text-sm text-[var(--soft-foreground)]">
            Add Supabase values to your local environment before proving auth end
            to end:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ul>
        </div>
      </SurfaceCard>
    </div>
  )
}
