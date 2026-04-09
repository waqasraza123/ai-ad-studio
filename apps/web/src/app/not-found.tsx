import Link from "next/link"
import { PublicPageHeader } from "@/components/i18n/public-page-header"
import { getServerI18n } from "@/lib/i18n/server"

export default async function NotFoundPage() {
  const { t } = await getServerI18n()

  return (
    <main className="theme-page-shell min-h-screen text-[var(--foreground)]">
      <PublicPageHeader />
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
          {t("errors.notFound.title")}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
          {t("errors.notFound.description")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="theme-inline-secondary-button inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium"
          >
            {t("public.header.backHome")}
          </Link>
          <Link
            href="/dashboard"
            className="theme-inline-secondary-button inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium"
          >
            {t("public.header.dashboard")}
          </Link>
        </div>
      </div>
    </main>
  )
}
