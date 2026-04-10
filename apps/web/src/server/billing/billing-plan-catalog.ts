export const BILLING_PHASE_34_MIGRATION =
  "202604101200_phase_34_activation_feedback_foundation.sql"

export type BillingPlanCatalogFailureCode = "query_failed" | "schema_drift"

export class BillingPlanCatalogError extends Error {
  readonly code: BillingPlanCatalogFailureCode
  readonly postgresCode: string | null

  constructor(input: {
    cause?: unknown
    code: BillingPlanCatalogFailureCode
    message: string
    postgresCode: string | null
  }) {
    super(input.message, {
      cause: input.cause
    })
    this.name = "BillingPlanCatalogError"
    this.code = input.code
    this.postgresCode = input.postgresCode
  }
}

function toPostgresCode(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code
  }

  return null
}

function toErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message
  }

  return null
}

export function createBillingPlanCatalogError(
  action: string,
  cause: unknown
) {
  const postgresCode = toPostgresCode(cause)
  const detail = toErrorMessage(cause)

  if (postgresCode === "42703") {
    return new BillingPlanCatalogError({
      cause,
      code: "schema_drift",
      message: `Failed to ${action}. Billing schema is out of date; apply supabase/migrations/${BILLING_PHASE_34_MIGRATION}.`,
      postgresCode
    })
  }

  return new BillingPlanCatalogError({
    cause,
    code: "query_failed",
    message: detail ? `Failed to ${action}: ${detail}` : `Failed to ${action}.`,
    postgresCode
  })
}

export function isBillingPlanCatalogError(
  error: unknown
): error is BillingPlanCatalogError {
  return error instanceof BillingPlanCatalogError
}
