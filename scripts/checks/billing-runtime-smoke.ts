type RuntimeStatus = "ok" | "degraded"

type BillingRuntimeDiagnostics = {
  capabilities?: {
    activeSubscriptionPlanChangesAvailable?: boolean
    billingPortalAvailable?: boolean
    checkoutSessionsAvailable?: boolean
    manualSettlementAvailable?: boolean
    webhookProcessingAvailable?: boolean
  }
  issues?: string[]
  planCatalog?: {
    missingPlanCodes?: string[]
    status?: RuntimeStatus
  }
  status?: RuntimeStatus
  stripe?: {
    apiReachable?: boolean
    prices?: Record<
      string,
      {
        status?: RuntimeStatus
      }
    >
    status?: RuntimeStatus
  }
}

type BillingSmokeConfig = {
  allowDegradedBilling: boolean
  baseUrl: string
  operatorSecret: string
  requestTimeoutMs: number
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function readRequiredString(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable ${name}`)
  }

  return value
}

function readBoolean(name: string) {
  const value = process.env[name]?.trim().toLowerCase()
  return value === "1" || value === "true" || value === "yes"
}

function readPositiveInteger(name: string, fallback: number) {
  const rawValue = process.env[name]?.trim()
  if (!rawValue) {
    return fallback
  }

  const parsedValue = Number.parseInt(rawValue, 10)
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback
}

function buildConfig(): BillingSmokeConfig {
  return {
    allowDegradedBilling: readBoolean("SMOKE_ALLOW_DEGRADED_BILLING"),
    baseUrl: readRequiredString("SMOKE_BASE_URL").replace(/\/+$/, ""),
    operatorSecret: readRequiredString("SMOKE_BILLING_OPERATOR_SECRET"),
    requestTimeoutMs: readPositiveInteger("SMOKE_REQUEST_TIMEOUT_MS", 10000)
  }
}

function logStep(message: string) {
  console.log(`[billing-smoke] ${message}`)
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  init?: RequestInit
) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function main() {
  const config = buildConfig()
  logStep(`checking billing runtime at ${config.baseUrl}`)

  const response = await fetchWithTimeout(
    `${config.baseUrl}/api/billing/operator/runtime`,
    config.requestTimeoutMs,
    {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${config.operatorSecret}`
      }
    }
  )

  assert(
    response.ok,
    `/api/billing/operator/runtime returned ${response.status} ${response.statusText}`
  )

  const diagnostics = (await response.json()) as BillingRuntimeDiagnostics

  assert(
    diagnostics.status === "ok" || diagnostics.status === "degraded",
    "Billing runtime diagnostics returned an unexpected status."
  )

  if (!config.allowDegradedBilling) {
    assert(
      diagnostics.status === "ok",
      `Billing runtime status is ${diagnostics.status}. Set SMOKE_ALLOW_DEGRADED_BILLING=true to allow this during smoke checks.`
    )
  }

  assert(
    diagnostics.planCatalog?.status === "ok",
    `Billing plan catalog is ${diagnostics.planCatalog?.status ?? "unknown"}.`
  )
  assert(
    (diagnostics.planCatalog?.missingPlanCodes?.length ?? 0) === 0,
    `Billing plan catalog is missing plan codes: ${(diagnostics.planCatalog?.missingPlanCodes ?? []).join(", ")}`
  )
  assert(
    diagnostics.stripe?.apiReachable,
    `Stripe API connectivity failed. ${(diagnostics.issues ?? []).join(" ")}`
  )
  assert(
    diagnostics.stripe?.status === "ok",
    `Stripe price readiness is ${diagnostics.stripe?.status ?? "unknown"}. ${(diagnostics.issues ?? []).join(" ")}`
  )
  assert(
    diagnostics.capabilities?.checkoutSessionsAvailable,
    "Stripe checkout sessions are not available."
  )
  assert(
    diagnostics.capabilities?.billingPortalAvailable,
    "Stripe billing portal is not available."
  )
  assert(
    diagnostics.capabilities?.webhookProcessingAvailable,
    "Stripe webhook processing is not available."
  )
  assert(
    diagnostics.capabilities?.activeSubscriptionPlanChangesAvailable,
    "Active subscription plan changes are not available."
  )
  assert(
    diagnostics.capabilities?.manualSettlementAvailable,
    "Manual settlement support is not available."
  )

  logStep("billing runtime ok")
}

main().catch((error) => {
  console.error(
    `[billing-smoke] ${error instanceof Error ? error.message : "Unknown error"}`
  )
  process.exitCode = 1
})
