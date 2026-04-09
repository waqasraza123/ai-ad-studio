import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getTestRouter } from "@/test/navigation"
import { StaleWorkspaceRefresh } from "./stale-workspace-refresh"

let visibilityState: DocumentVisibilityState = "visible"

function setVisibilityState(nextState: DocumentVisibilityState) {
  visibilityState = nextState

  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => visibilityState
  })
}

describe("StaleWorkspaceRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setVisibilityState("visible")
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("refreshes with backoff while active and visible", async () => {
    render(<StaleWorkspaceRefresh active intervalMs={1000} />)

    const router = getTestRouter()

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    expect(router.refresh).toHaveBeenCalledTimes(1)

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    expect(router.refresh).toHaveBeenCalledTimes(2)

    await act(async () => {
      vi.advanceTimersByTime(1999)
    })
    expect(router.refresh).toHaveBeenCalledTimes(2)

    await act(async () => {
      vi.advanceTimersByTime(1)
    })
    expect(router.refresh).toHaveBeenCalledTimes(3)
  })

  it("stops hidden-tab refreshes and resumes immediately when the page becomes visible again", async () => {
    setVisibilityState("hidden")

    render(<StaleWorkspaceRefresh active intervalMs={1000} />)

    const router = getTestRouter()

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    expect(router.refresh).not.toHaveBeenCalled()

    setVisibilityState("visible")
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"))
    })
    expect(router.refresh).toHaveBeenCalledTimes(1)

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    expect(router.refresh).toHaveBeenCalledTimes(2)
  })
})
