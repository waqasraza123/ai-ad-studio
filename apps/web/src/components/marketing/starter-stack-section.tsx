import Link from "next/link"
import { ArrowUpRight, Blocks, Database, Github, ServerCog } from "lucide-react"
import { PublicSectionFrame } from "@/components/layout/page-frame"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getServerI18n } from "@/lib/i18n/server"
import { AI_AD_STUDIO_REPOSITORY_URL } from "./marketing-links"

export async function StarterStackSection() {
  const { t } = await getServerI18n()
  const stackLayers = [
    {
      description: t("marketing.stack.product.description"),
      icon: Blocks,
      items: [
        t("marketing.stack.product.itemOne"),
        t("marketing.stack.product.itemTwo"),
        t("marketing.stack.product.itemThree")
      ],
      title: t("marketing.stack.product.title")
    },
    {
      description: t("marketing.stack.backend.description"),
      icon: Database,
      items: [
        t("marketing.stack.backend.itemOne"),
        t("marketing.stack.backend.itemTwo"),
        t("marketing.stack.backend.itemThree")
      ],
      title: t("marketing.stack.backend.title")
    },
    {
      description: t("marketing.stack.runtime.description"),
      icon: ServerCog,
      items: [
        t("marketing.stack.runtime.itemOne"),
        t("marketing.stack.runtime.itemTwo"),
        t("marketing.stack.runtime.itemThree")
      ],
      title: t("marketing.stack.runtime.title")
    }
  ]

  return (
    <section id="stack" className="py-24">
      <PublicSectionFrame>
        <div className="max-w-3xl">
          <p className="theme-marketing-eyebrow">
            {t("marketing.stack.eyebrow")}
          </p>
          <h2 className="theme-marketing-title mt-4 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            {t("marketing.stack.title")}
          </h2>
          <p className="theme-marketing-copy mt-4">
            {t("marketing.stack.description")}
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {stackLayers.map((layer) => {
            const Icon = layer.icon

            return (
              <SurfaceCard
                key={layer.title}
                className="theme-marketing-card-lift h-full p-6"
              >
                <div className="theme-icon-chip flex h-12 w-12 items-center justify-center rounded-2xl border">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-medium text-[var(--foreground)]">
                  {layer.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                  {layer.description}
                </p>
                <ul className="mt-5 space-y-3 text-sm text-[var(--soft-foreground)]">
                  {layer.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--accent-rgb))]"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </SurfaceCard>
            )
          })}
        </div>

        <div className="theme-accent-panel mt-10 overflow-hidden rounded-[2.5rem] border p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="theme-marketing-eyebrow">
                {t("marketing.stack.customizeEyebrow")}
              </p>
              <h3 className="theme-marketing-title mt-4 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
                {t("marketing.stack.customizeTitle")}
              </h3>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--soft-foreground)]">
                {t("marketing.stack.customizeDescription")}
              </p>
            </div>

            <Link
              href={AI_AD_STUDIO_REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-button-primary inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium"
            >
              <Github className="h-4 w-4" />
              {t("marketing.actions.viewGithub")}
              <ArrowUpRight className="theme-directional-icon h-4 w-4" />
            </Link>
          </div>
        </div>
      </PublicSectionFrame>
    </section>
  )
}
