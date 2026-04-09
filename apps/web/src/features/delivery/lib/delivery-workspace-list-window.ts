export const DEFAULT_DELIVERY_WORKSPACE_VISIBLE_COUNT = 8
export const DELIVERY_WORKSPACE_VISIBLE_COUNT_STEP = 8

function clampMinimumVisibleCount(value: number) {
  return Math.max(value, DEFAULT_DELIVERY_WORKSPACE_VISIBLE_COUNT)
}

function roundUpToStep(value: number) {
  return (
    Math.ceil(value / DELIVERY_WORKSPACE_VISIBLE_COUNT_STEP) *
    DELIVERY_WORKSPACE_VISIBLE_COUNT_STEP
  )
}

function normalizeRequestedCount(
  requestedCount: number | null | undefined,
  totalCount: number
) {
  if (totalCount <= 0) {
    return 0
  }

  if (!Number.isFinite(requestedCount)) {
    return Math.min(DEFAULT_DELIVERY_WORKSPACE_VISIBLE_COUNT, totalCount)
  }

  return Math.min(
    clampMinimumVisibleCount(Math.trunc(requestedCount ?? 0)),
    totalCount
  )
}

export function resolveDeliveryWorkspaceVisibleCount(input: {
  focusedWorkspaceIndex?: number | null
  requestedCount?: number | null
  totalCount: number
}) {
  const totalCount = Math.max(0, input.totalCount)
  const normalizedRequestedCount = normalizeRequestedCount(
    input.requestedCount,
    totalCount
  )

  if (totalCount === 0) {
    return 0
  }

  const focusedWorkspaceIndex = input.focusedWorkspaceIndex ?? -1
  if (
    focusedWorkspaceIndex < 0 ||
    focusedWorkspaceIndex >= totalCount ||
    focusedWorkspaceIndex < normalizedRequestedCount
  ) {
    return normalizedRequestedCount
  }

  return Math.min(roundUpToStep(focusedWorkspaceIndex + 1), totalCount)
}

export function getNextDeliveryWorkspaceVisibleCount(input: {
  currentCount: number
  totalCount: number
}) {
  if (input.totalCount <= 0) {
    return 0
  }

  return Math.min(
    input.currentCount + DELIVERY_WORKSPACE_VISIBLE_COUNT_STEP,
    input.totalCount
  )
}
