import { LockKeyhole, UserRoundPlus } from "lucide-react"
import { signInWithPassword, signUpWithPassword } from "@/app/login/actions"
import { RunwayBrandPanel } from "@/components/branding/runway-brand-panel"
import { DemoSignInReveal } from "@/components/auth/demo-sign-in-reveal"
import { FormSubmitButton } from "@/components/primitives/form-submit-button"
import { SurfaceCard } from "@/components/primitives/surface-card"
import { getHomeDemoSignIn } from "@/lib/home-demo-signin"

type AuthPanelProps = {
  errorMessage?: string
  infoMessage?: string
  defaultSignInEmail?: string
  defaultSignInPassword?: string
}

export function AuthPanel({
  errorMessage,
  infoMessage,
  defaultSignInEmail,
  defaultSignInPassword
}: AuthPanelProps) {
  const demoSignIn = getHomeDemoSignIn()

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SurfaceCard className="p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
          Authentication
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
          Sign in to AI Ad Studio
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
          Authentication secures access to projects, concepts, exports, and
          other protected routes in the studio.
        </p>

        <RunwayBrandPanel className="mt-8" />

        <div className="mt-8 grid gap-4">
          <div className="theme-soft-panel rounded-[1.5rem] border p-5">
            <p className="text-sm font-medium text-[var(--foreground)]">
              Protected application area
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Dashboard routes are now gated by authenticated session checks
              when Supabase credentials are present.
            </p>
          </div>

          <div className="theme-soft-panel rounded-[1.5rem] border p-5">
            <p className="text-sm font-medium text-[var(--foreground)]">
              Runtime setup matters
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Runway is the recommended hosted path, while hybrid and local HTTP
              modes can be used when your machine or remote GPU environment is
              set up for them.
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
                  Sign in
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Access the protected dashboard shell.
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
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={defaultSignInEmail ?? undefined}
                  className="theme-focus-ring h-11 rounded-2xl border border-[var(--border)] bg-[var(--background-soft)] px-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)]"
                  placeholder="john@example.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-[var(--soft-foreground)]">
                  Password
                </span>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  defaultValue={defaultSignInPassword ?? undefined}
                  className="theme-focus-ring h-11 rounded-2xl border border-[var(--border)] bg-[var(--background-soft)] px-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)]"
                  placeholder="••••••••"
                />
              </label>
            </div>

            <div className="mt-5">
              <FormSubmitButton className="w-full" pendingLabel="Signing in…">
                Sign in
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
                  Create account
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Set up a local account to use the studio.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-2">
                <span className="text-sm text-[var(--soft-foreground)]">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="theme-focus-ring h-11 rounded-2xl border border-[var(--border)] bg-[var(--background-soft)] px-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)]"
                  placeholder="john@example.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-[var(--soft-foreground)]">
                  Password
                </span>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="theme-focus-ring h-11 rounded-2xl border border-[var(--border)] bg-[var(--background-soft)] px-4 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)]"
                  placeholder="Create a password"
                />
              </label>
            </div>

            <div className="mt-5">
              <FormSubmitButton
                className="w-full"
                variant="secondary"
                pendingLabel="Creating account…"
              >
                Create account
              </FormSubmitButton>
            </div>
          </form>
        </div>
      </SurfaceCard>
    </div>
  )
}
