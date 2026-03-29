import { LockKeyhole, UserRoundPlus } from "lucide-react"
import { signInWithPassword, signUpWithPassword } from "@/app/login/actions"
import { Button } from "@/components/primitives/button"
import { SurfaceCard } from "@/components/primitives/surface-card"

type AuthPanelProps = {
  errorMessage?: string
  infoMessage?: string
  defaultSignInEmail?: string
}

export function AuthPanel({
  errorMessage,
  infoMessage,
  defaultSignInEmail,
}: AuthPanelProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SurfaceCard className="p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          Authentication
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
          Sign in to AI Ad Studio
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
          Authentication secures access to projects, concepts, exports, and
          other protected routes in the studio.
        </p>

        <div className="mt-8 grid gap-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-medium text-white">
              Protected application area
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Dashboard routes are now gated by authenticated session checks when
              Supabase credentials are present.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-medium text-white">Schema-first backend</p>
            <p className="mt-2 text-sm text-slate-400">
              Versioned SQL migrations for profiles, projects, concepts, jobs, and
              exports are now part of the repo.
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
          <form action={signInWithPassword} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                <LockKeyhole className="h-4 w-4 text-amber-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Sign in</p>
                <p className="text-sm text-slate-400">
                  Access the protected dashboard shell.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">Email</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={defaultSignInEmail ?? undefined}
                  className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
                  placeholder="waqas@example.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-slate-300">Password</span>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
                  placeholder="••••••••"
                />
              </label>
            </div>

            <div className="mt-5">
              <Button className="w-full">Sign in</Button>
            </div>
          </form>

          <form action={signUpWithPassword} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                <UserRoundPlus className="h-4 w-4 text-amber-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Create account</p>
                <p className="text-sm text-slate-400">
                  Set up a local account to use the studio.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">Email</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
                  placeholder="waqas@example.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-slate-300">Password</span>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40"
                  placeholder="Create a password"
                />
              </label>
            </div>

            <div className="mt-5">
              <Button className="w-full" variant="secondary">
                Create account
              </Button>
            </div>
          </form>
        </div>
      </SurfaceCard>
    </div>
  )
}
