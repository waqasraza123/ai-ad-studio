import { vi } from "vitest"

type NavigationState = {
  pathname: string
  searchParams: URLSearchParams
}

export type MockRouter = {
  back: () => void
  forward: () => void
  prefetch: () => void
  push: () => void
  refresh: () => void
  replace: () => void
}

const state: NavigationState = {
  pathname: "/",
  searchParams: new URLSearchParams()
}

const router: MockRouter = {
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn()
}

export function resetTestNavigation() {
  state.pathname = "/"
  state.searchParams = new URLSearchParams()
  router.back = vi.fn()
  router.forward = vi.fn()
  router.prefetch = vi.fn()
  router.push = vi.fn()
  router.refresh = vi.fn()
  router.replace = vi.fn()
}

export function setTestNavigation(input?: {
  pathname?: string
  searchParams?:
    | string
    | URLSearchParams
    | Record<string, string | number | boolean | null | undefined>
}) {
  state.pathname = input?.pathname ?? "/"

  if (!input?.searchParams) {
    state.searchParams = new URLSearchParams()
    return
  }

  if (
    typeof input.searchParams === "string" ||
    input.searchParams instanceof URLSearchParams
  ) {
    state.searchParams = new URLSearchParams(input.searchParams)
    return
  }

  const params = new URLSearchParams()

  Object.entries(input.searchParams).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return
    }

    params.set(key, String(value))
  })

  state.searchParams = params
}

export function usePathname() {
  return state.pathname
}

export function useSearchParams() {
  return new URLSearchParams(state.searchParams)
}

export function useRouter(): MockRouter {
  return router
}

export function getTestRouter(): MockRouter {
  return router
}

export function redirect() {
  throw new Error("redirect should be mocked in tests that exercise it directly.")
}
