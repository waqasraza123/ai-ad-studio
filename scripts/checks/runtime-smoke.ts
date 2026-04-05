type ReadinessPayload = {
  publicAppUrlConfigured?: boolean
  r2Configured?: boolean
  serviceRoleConfigured?: boolean
  supabaseAuthConfigured?: boolean
}

type HealthPayload = {
  name?: string
  readiness?: ReadinessPayload
  service?: string
  status?: string
  timestamp?: string
}

type SmokeConfig = {
  allowDegradedHealth: boolean
  baseUrl: string
  campaignToken: string | null
  checkCampaignDownload: boolean
  checkShareDownload: boolean
  deliveryExportId: string | null
  deliveryToken: string | null
  requestTimeoutMs: number
  reviewToken: string | null
  shareToken: string | null
}

function readRequiredString(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable ${name}`)
  }

  return value
}

function readOptionalString(name: string) {
  const value = process.env[name]?.trim()
  return value && value.length > 0 ? value : null
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

function buildConfig(): SmokeConfig {
  return {
    allowDegradedHealth: readBoolean("SMOKE_ALLOW_DEGRADED_HEALTH"),
    baseUrl: readRequiredString("SMOKE_BASE_URL").replace(/\/+$/, ""),
    campaignToken: readOptionalString("SMOKE_CAMPAIGN_TOKEN"),
    checkCampaignDownload: readBoolean("SMOKE_CHECK_CAMPAIGN_DOWNLOAD"),
    checkShareDownload: readBoolean("SMOKE_CHECK_SHARE_DOWNLOAD"),
    deliveryExportId: readOptionalString("SMOKE_DELIVERY_EXPORT_ID"),
    deliveryToken: readOptionalString("SMOKE_DELIVERY_TOKEN"),
    requestTimeoutMs: readPositiveInteger("SMOKE_REQUEST_TIMEOUT_MS", 10000),
    reviewToken: readOptionalString("SMOKE_REVIEW_TOKEN"),
    shareToken: readOptionalString("SMOKE_SHARE_TOKEN")
  }
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
      redirect: "follow",
      signal: controller.signal
    })
  } finally {
    clearTimeout(timeout)
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function logStep(message: string) {
  console.log(`[smoke] ${message}`)
}

async function assertHtmlRoute(input: {
  expectedText: string
  name: string
  path: string
  timeoutMs: number
}) {
  const response = await fetchWithTimeout(input.path, input.timeoutMs, {
    headers: {
      accept: "text/html"
    }
  })

  assert(
    response.ok,
    `${input.name} returned ${response.status} ${response.statusText}`
  )

  const contentType = response.headers.get("content-type") ?? ""
  assert(
    contentType.includes("text/html"),
    `${input.name} did not return HTML content`
  )

  const body = await response.text()
  assert(
    body.includes(input.expectedText),
    `${input.name} did not include expected marker text "${input.expectedText}"`
  )

  logStep(`${input.name} ok`)
}

async function assertBinaryDownload(input: {
  name: string
  path: string
  timeoutMs: number
}) {
  const response = await fetchWithTimeout(input.path, input.timeoutMs)

  assert(
    response.ok,
    `${input.name} returned ${response.status} ${response.statusText}`
  )

  const contentType = response.headers.get("content-type") ?? ""
  assert(
    !contentType.includes("text/html"),
    `${input.name} returned HTML instead of a download`
  )

  await response.body?.cancel()
  logStep(`${input.name} ok`)
}

function assertReadinessForConfiguredSurfaces(
  config: SmokeConfig,
  healthPayload: HealthPayload
) {
  const readiness = healthPayload.readiness ?? {}
  const requiresServiceRoleTokenSurface =
    Boolean(config.shareToken) ||
    Boolean(config.campaignToken) ||
    Boolean(config.deliveryToken)

  const requiresBinaryDownload =
    config.checkCampaignDownload ||
    config.checkShareDownload ||
    Boolean(config.deliveryToken && config.deliveryExportId)

  if (requiresServiceRoleTokenSurface) {
    assert(
      readiness.serviceRoleConfigured,
      "Health readiness reports missing SUPABASE_SERVICE_ROLE_KEY, but share/campaign/delivery surface checks were requested"
    )
  }

  if (requiresBinaryDownload) {
    assert(
      readiness.r2Configured,
      "Health readiness reports missing R2 configuration, but download checks were requested"
    )
  }
}

async function main() {
  const config = buildConfig()

  logStep(`checking ${config.baseUrl}`)

  const healthResponse = await fetchWithTimeout(
    `${config.baseUrl}/api/health`,
    config.requestTimeoutMs,
    {
      headers: {
        accept: "application/json"
      }
    }
  )

  assert(
    healthResponse.ok,
    `/api/health returned ${healthResponse.status} ${healthResponse.statusText}`
  )

  const healthPayload = (await healthResponse.json()) as HealthPayload

  assert(healthPayload.name === "AI Ad Studio", "Unexpected health payload name")
  assert(healthPayload.service === "web", "Unexpected health payload service")
  assert(
    healthPayload.status === "ok" || healthPayload.status === "degraded",
    "Unexpected health payload status"
  )
  assert(
    typeof healthPayload.timestamp === "string" && healthPayload.timestamp.length > 0,
    "Health payload timestamp is missing"
  )

  if (!config.allowDegradedHealth) {
    assert(
      healthPayload.status === "ok",
      `Health status is ${healthPayload.status}. Set SMOKE_ALLOW_DEGRADED_HEALTH=true to allow this during smoke checks.`
    )
  }

  assertReadinessForConfiguredSurfaces(config, healthPayload)
  logStep("/api/health ok")

  if (config.shareToken) {
    await assertHtmlRoute({
      expectedText: "Shared export",
      name: "share page",
      path: `${config.baseUrl}/share/${config.shareToken}`,
      timeoutMs: config.requestTimeoutMs
    })
  }

  if (config.checkShareDownload) {
    assert(config.shareToken, "SMOKE_SHARE_TOKEN is required for share download checks")
    await assertBinaryDownload({
      name: "share download",
      path: `${config.baseUrl}/share/${config.shareToken}/download`,
      timeoutMs: config.requestTimeoutMs
    })
  }

  if (config.campaignToken) {
    await assertHtmlRoute({
      expectedText: "Public campaign",
      name: "campaign page",
      path: `${config.baseUrl}/campaign/${config.campaignToken}`,
      timeoutMs: config.requestTimeoutMs
    })
  }

  if (config.checkCampaignDownload) {
    assert(
      config.campaignToken,
      "SMOKE_CAMPAIGN_TOKEN is required for campaign download checks"
    )
    await assertBinaryDownload({
      name: "campaign download",
      path: `${config.baseUrl}/campaign/${config.campaignToken}/download`,
      timeoutMs: config.requestTimeoutMs
    })
  }

  if (config.deliveryToken) {
    await assertHtmlRoute({
      expectedText: "Client delivery",
      name: "delivery page",
      path: `${config.baseUrl}/delivery/${config.deliveryToken}`,
      timeoutMs: config.requestTimeoutMs
    })
  }

  if (config.deliveryToken && config.deliveryExportId) {
    await assertBinaryDownload({
      name: "delivery download",
      path: `${config.baseUrl}/delivery/${config.deliveryToken}/download/${config.deliveryExportId}`,
      timeoutMs: config.requestTimeoutMs
    })
  }

  if (config.reviewToken) {
    await assertHtmlRoute({
      expectedText: "External batch review",
      name: "review page",
      path: `${config.baseUrl}/review/${config.reviewToken}`,
      timeoutMs: config.requestTimeoutMs
    })
  }

  logStep("runtime smoke checks passed")
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[smoke] failed: ${message}`)
  process.exitCode = 1
})
