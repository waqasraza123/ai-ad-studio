import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"

type ConfigurationRequiredProps = {
  title: string
  description: string
}

export async function ConfigurationRequired({
  description,
  title
}: ConfigurationRequiredProps) {
  const { t } = await getServerI18n()

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
      <SurfaceCard className="w-full p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
          {t("configuration.required.eyebrow")}
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
          {title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">{description}</p>
        <div className="theme-soft-panel mt-8 rounded-[1.5rem] border p-4">
          <p className="text-sm text-[var(--soft-foreground)]">
            {t("configuration.required.description")}
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
