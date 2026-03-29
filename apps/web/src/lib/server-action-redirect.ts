import { redirect } from "next/navigation"

/** Appends `error=<code>` to path (handles existing query string). */
export function redirectWithFormError(path: string, errorCode: string): never {
  const sep = path.includes("?") ? "&" : "?"
  redirect(`${path}${sep}error=${encodeURIComponent(errorCode)}`)
}

export function redirectToLoginWithFormError(errorCode: string): never {
  redirect(`/login?error=${encodeURIComponent(errorCode)}`)
}
