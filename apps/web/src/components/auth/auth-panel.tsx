import { LockKeyhole, UserRoundPlus } from "lucide-react"
import { signInWithPassword, signUpWithPassword } from "@/app/login/actions"
import { RunwayBrandPanel } from "@/components/branding/runway-brand-panel"
import { DemoSignInReveal } from "@/components/auth/demo-sign-in-reveal"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getHomeDemoSignIn } from "@/lib/home-demo-signin"
import { getServerI18n } from "@/lib/i18n/server"

type AuthPanelProps = {
  errorMessage?: string
  infoMessage?: string
  defaultSignInEmail?: string
  defaultSignInPassword?: string
}

export async function AuthPanel({
  errorMessage,
  infoMessage,
  defaultSignInEmail,
  defaultSignInPassword
}: AuthPanelProps) {
  const demoSignIn = getHomeDemoSignIn()
  const { t } = await getServerI18n()

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SurfaceCard className="p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
          {t("auth.title")}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
          {t("auth.heading")}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
          {t("auth.description")}
        </p>

        <RunwayBrandPanel className="mt-8" />

        <div className="mt-8 grid gap-4">
          <div className="theme-soft-panel rounded-[1.5rem] border p-5">
            <p className="text-sm font-medium text-[var(--foreground)]">
              {t("auth.protectedAreaTitle")}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {t("auth.protectedAreaDescription")}
            </p>
          </div>

          <div className="theme-soft-panel rounded-[1.5rem] border p-5">
            <p className="text-sm font-medium text-[var(--foreground)]">
              {t("auth.runtimeTitle")}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {t("auth.runtimeDescription")}
            </p>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-8">
        {errorMessage ? (
          <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {errorMessage}
          </div>
        ) : null}

        {infoMessage ? (
          <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {infoMessage}
          </div>
        ) : null}

        <div className="grid gap-4">
          <form
            action={signInWithPassword}
            className="theme-soft-panel rounded-[1.5rem] border p-5"
          >
            <div className="flex items-center gap-3">
              <div className="theme-icon-chip flex h-10 w-10 items-center justify-center rounded-2xl border">
                <LockKeyhole className="h-4 w-4 text-[rgb(var(--accent-rgb))]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {t("auth.signInTitle")}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {t("auth.signInDescription")}
                </p>
              </div>
            </div>

            <DemoSignInReveal
              email={demoSignIn.email}
              password={demoSignIn.password}
              subtext={demoSignIn.subtext}
            />

            <div className="mt-5 grid gap-3">
              <label className="grid gap-2">
                <span className="text-sm text-[var(--soft-foreground)]">
                  {t("common.words.email")}
                </span>
                <input
                  name="email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  defaultValue={defaultSignInEmail ?? undefined}
                  className="theme-bidi-isolate theme-focus-ring h-11 rounded-2xl border border-[var(--border)] bg-[var(--background-soft)] px-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)]"
                  placeholder={t("auth.placeholders.email")}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-[var(--soft-foreground)]">
                  {t("common.words.password")}
                </span>
                <input
                  name="password"
                  type="password"
                  dir="ltr"
                  autoComplete="current-password"
                  defaultValue={defaultSignInPassword ?? undefined}
                  className="theme-bidi-isolate theme-focus-ring h-11 rounded-2xl border border-[var(--border)] bg-[var(--background-soft)] px-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)]"
                  placeholder={t("auth.placeholders.password")}
                />
              </label>
            </div>

            <div className="mt-5">
              <FormSubmitButton className="w-full" pendingLabel={t("auth.signInPending")}>
                {t("auth.signInAction")}
              </FormSubmitButton>
            </div>
          </form>

          <form
            action={signUpWithPassword}
            className="theme-soft-panel rounded-[1.5rem] border p-5"
          >
            <div className="flex items-center gap-3">
              <div className="theme-icon-chip flex h-10 w-10 items-center justify-center rounded-2xl border">
                <UserRoundPlus className="h-4 w-4 text-[rgb(var(--accent-rgb))]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {t("auth.signUpTitle")}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {t("auth.signUpDescription")}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-2">
                <span className="text-sm text-[var(--soft-foreground)]">
                  {t("common.words.email")}
                </span>
                <input
                  name="email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  className="theme-bidi-isolate theme-focus-ring h-11 rounded-2xl border border-[var(--border)] bg-[var(--background-soft)] px-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)]"
                  placeholder={t("auth.placeholders.email")}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-[var(--soft-foreground)]">
                  {t("common.words.password")}
                </span>
                <input
                  name="password"
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  className="theme-bidi-isolate theme-focus-ring h-11 rounded-2xl border border-[var(--border)] bg-[var(--background-soft)] px-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)]"
                  placeholder={t("auth.placeholders.newPassword")}
                />
              </label>
            </div>

            <div className="mt-5">
              <FormSubmitButton
                className="w-full"
                variant="secondary"
                pendingLabel={t("auth.signUpPending")}
              >
                {t("auth.signUpAction")}
              </FormSubmitButton>
            </div>
          </form>
        </div>
      </SurfaceCard>
    </div>
  )
}
