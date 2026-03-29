import { redirect } from "next/navigation"
import { AuthPanel } from "@/components/auth/auth-panel"
import { ConfigurationRequired } from "@/components/auth/configuration-required"
import { LandingTopBar } from "@/components/marketing/landing-top-bar"
import { hasSupabaseAuthConfiguration } from "@/lib/env"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function readSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key]

  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  if (!hasSupabaseAuthConfiguration()) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.12),transparent_28rem),linear-gradient(180deg,#050816_0%,#0b1224_100%)] text-slate-50">
        <LandingTopBar />
        <div className="px-4 py-10 sm:px-6 lg:px-8">
          <ConfigurationRequired
            title="Connect Supabase to prove auth end to end"
            description="This repo now contains the auth integration points, protected route logic, and versioned schema files. Add your Supabase credentials locally to validate real sign-in and session flow."
          />
        </div>
      </main>
    )
  }

  const user = await getAuthenticatedUser()

  if (user) {
    redirect("/dashboard")
  }

  const errorMessage = readSearchParam(params, "error")
  const infoMessage = readSearchParam(params, "message")
  const defaultEmail = readSearchParam(params, "email")

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.12),transparent_28rem),linear-gradient(180deg,#050816_0%,#0b1224_100%)] text-slate-50">
      <LandingTopBar />
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <AuthPanel
            errorMessage={errorMessage}
            infoMessage={infoMessage}
            defaultSignInEmail={defaultEmail}
          />
        </div>
      </div>
    </main>
  )
}
