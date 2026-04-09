import fs from "node:fs/promises"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import {
  type E2EFixtureManifest,
  seedProjectIds,
  seedTokens,
  tinyPreviewDataUrl
} from "./fixture-manifest"
import {
  e2eFixtureManifestPath,
  e2eGeneratedDirectory,
  webAppRoot
} from "./paths"

const e2eEnvironmentSchema = z.object({
  E2E_OWNER_EMAIL: z.string().email().default("playwright-owner@aiadstudio.local"),
  E2E_OWNER_PASSWORD: z.string().min(8).default("PlaywrightOwner!234"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
})

type SeedEnvironment = z.infer<typeof e2eEnvironmentSchema>

type AdminUser = {
  email?: string
  id: string
}

async function loadLocalEnvironmentFiles() {
  for (const fileName of [".env.local", ".env"]) {
    try {
      const fileContents = await fs.readFile(path.join(webAppRoot, fileName), "utf8")

      for (const rawLine of fileContents.split(/\r?\n/)) {
        const trimmedLine = rawLine.trim()

        if (
          trimmedLine.length === 0 ||
          trimmedLine.startsWith("#") ||
          !trimmedLine.includes("=")
        ) {
          continue
        }

        const normalizedLine = trimmedLine.startsWith("export ")
          ? trimmedLine.slice("export ".length)
          : trimmedLine
        const separatorIndex = normalizedLine.indexOf("=")
        const key = normalizedLine.slice(0, separatorIndex).trim()
        const rawValue = normalizedLine.slice(separatorIndex + 1).trim()

        if (!key || process.env[key] != null) {
          continue
        }

        const unquotedValue =
          (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
          (rawValue.startsWith("'") && rawValue.endsWith("'"))
            ? rawValue.slice(1, -1)
            : rawValue

        process.env[key] = unquotedValue
      }
    } catch (error) {
      if (
        typeof error === "object" &&
        error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        continue
      }

      throw error
    }
  }
}

async function readSeedEnvironment(): Promise<SeedEnvironment> {
  await loadLocalEnvironmentFiles()

  return e2eEnvironmentSchema.parse({
    E2E_OWNER_EMAIL: process.env.E2E_OWNER_EMAIL,
    E2E_OWNER_PASSWORD: process.env.E2E_OWNER_PASSWORD,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  })
}

function createServiceRoleClient(environment: SeedEnvironment) {
  return createClient(environment.NEXT_PUBLIC_SUPABASE_URL, environment.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

async function findUserByEmail(
  client: ReturnType<typeof createServiceRoleClient>,
  email: string
) {
  let page = 1

  while (page <= 5) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: 200
    })

    if (error) {
      throw error
    }

    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())
    if (match) {
      return match as AdminUser
    }

    if (!data.nextPage) {
      break
    }

    page = data.nextPage
  }

  return null
}

async function purgeOwnerFixtureRows(
  client: ReturnType<typeof createServiceRoleClient>,
  ownerId: string
) {
  const deletionQueries = [
    ["delivery_workspace_events", "owner_id"],
    ["delivery_workspace_exports", "owner_id"],
    ["delivery_workspaces", "owner_id"],
    ["batch_review_comments", "owner_id"],
    ["batch_review_links", "owner_id"],
    ["share_campaigns", "owner_id"],
    ["showcase_items", "owner_id"],
    ["share_links", "owner_id"],
    ["notifications", "owner_id"],
    ["usage_events", "owner_id"],
    ["billing_events", "owner_id"],
    ["render_batches", "owner_id"],
    ["exports", "owner_id"],
    ["assets", "owner_id"],
    ["jobs", "owner_id"],
    ["concepts", "owner_id"],
    ["project_inputs", "owner_id"],
    ["projects", "owner_id"],
    ["brand_kits", "owner_id"],
    ["platform_render_packs", "owner_id"],
    ["ad_templates", "owner_id"],
    ["billing_usage_rollups", "owner_id"],
    ["owner_guardrails", "owner_id"],
    ["owner_subscriptions", "owner_id"],
    ["owner_billing_accounts", "owner_id"]
  ] as const

  for (const [table, column] of deletionQueries) {
    const { error } = await client.from(table).delete().eq(column, ownerId)

    if (error) {
      throw error
    }
  }
}

async function ensureOwnerUser(
  client: ReturnType<typeof createServiceRoleClient>,
  environment: SeedEnvironment
) {
  const existingUser = await findUserByEmail(client, environment.E2E_OWNER_EMAIL)

  if (existingUser) {
    const { data, error } = await client.auth.admin.updateUserById(existingUser.id, {
      email: environment.E2E_OWNER_EMAIL,
      email_confirm: true,
      password: environment.E2E_OWNER_PASSWORD,
      user_metadata: {
        source: "playwright-e2e"
      }
    })

    if (error) {
      throw error
    }

    return data.user as AdminUser
  }

  const { data, error } = await client.auth.admin.createUser({
    email: environment.E2E_OWNER_EMAIL,
    email_confirm: true,
    password: environment.E2E_OWNER_PASSWORD,
    user_metadata: {
      source: "playwright-e2e"
    }
  })

  if (error) {
    throw error
  }

  return data.user as AdminUser
}

function buildDeliveryWorkspaces(ownerId: string, projectId: string, renderBatchId: string, canonicalExportId: string) {
  const now = Date.now()

  return Array.from({ length: 10 }, (_, index) => {
    const workspaceId =
      index === 0
        ? seedProjectIds.deliveryPrimaryWorkspace
        : index === 1
          ? seedProjectIds.deliveryAcknowledgementWorkspace
          : `e2e-delivery-workspace-${String(index + 1).padStart(2, "0")}`
    const token =
      index === 0
        ? seedTokens.delivery
        : index === 1
          ? seedTokens.deliveryAcknowledgement
          : `e2edeliverylisttoken${String(index + 1).padStart(4, "0")}`
    const createdAt = new Date(now - index * 60 * 60 * 1000).toISOString()
    const dueOn = new Date(now + (index - 4) * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)

    return {
      approval_summary: {
        approved_count: index % 3 === 0 ? 1 : 0,
        decided_at: null,
        finalization_note:
          index === 0 ? "Approved for client handoff." : null,
        finalized_at: index === 0 ? createdAt : null,
        pending_count: index === 1 ? 1 : 0,
        rejected_count: index % 4 === 0 ? 1 : 0,
        responded_count: index % 2 === 0 ? 1 : 0,
        review_note:
          index === 0 ? "Client asked for a brighter CTA end card." : null
      },
      canonical_export_id: canonicalExportId,
      follow_up_due_on: dueOn,
      follow_up_last_notification_bucket: index % 2 === 0 ? "due_today" : "upcoming",
      follow_up_last_notification_date: createdAt.slice(0, 10),
      follow_up_note:
        index % 2 === 0 ? "Check download confirmation with the client." : null,
      follow_up_status:
        index === 0 ? "resolved" : index % 2 === 0 ? "needs_follow_up" : "waiting_on_client",
      follow_up_updated_at: createdAt,
      handoff_notes:
        index === 0
          ? "Primary delivery package for the seeded public route."
          : `Seeded delivery workspace ${index + 1} for dashboard list coverage.`,
      id: workspaceId,
      owner_id: ownerId,
      project_id: projectId,
      reminder_mismatch_resolution_note: null,
      reminder_mismatch_resolved_at: null,
      reminder_mismatch_resolved_notification_id: null,
      render_batch_id: renderBatchId,
      status: "active",
      summary:
        index === 1
          ? "Workspace dedicated to acknowledgement-flow coverage."
          : `Seeded delivery workspace ${index + 1} summary.`,
      title:
        index === 0
          ? "Seeded delivery handoff"
          : index === 1
            ? "Delivery acknowledgement sandbox"
            : `Seeded delivery workspace ${index + 1}`,
      token,
      updated_at: createdAt
    }
  })
}

async function seedTables(
  client: ReturnType<typeof createServiceRoleClient>,
  ownerId: string
) {
  const now = new Date()
  const nowIso = now.toISOString()
  const currentPeriodStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  ).toISOString()
  const currentPeriodEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0)
  ).toISOString()

  const deliveryWorkspaces = buildDeliveryWorkspaces(
    ownerId,
    seedProjectIds.project,
    seedProjectIds.renderBatch,
    seedProjectIds.canonicalExport
  )

  const sharedExportRows = [
    {
      asset_id: seedProjectIds.videoLikeAsset,
      aspect_ratio: "9:16",
      concept_id: seedProjectIds.concept,
      id: seedProjectIds.canonicalExport,
      owner_id: ownerId,
      platform_preset: "instagram_reels",
      project_id: seedProjectIds.project,
      render_metadata: {
        batchId: seedProjectIds.renderBatch,
        previewDataUrl: tinyPreviewDataUrl,
        templateName: "Premium Cinematic",
        templateStyleKey: "premium_cinematic",
        variantKey: "default"
      },
      status: "ready",
      variant_key: "default",
      version: 1
    },
    {
      asset_id: seedProjectIds.secondaryExportAsset,
      aspect_ratio: "1:1",
      concept_id: seedProjectIds.concept,
      id: seedProjectIds.secondaryExport,
      owner_id: ownerId,
      platform_preset: "instagram_feed",
      project_id: seedProjectIds.project,
      render_metadata: {
        batchId: seedProjectIds.renderBatch,
        previewDataUrl: tinyPreviewDataUrl,
        templateName: "Premium Cinematic",
        templateStyleKey: "premium_cinematic",
        variantKey: "caption_heavy"
      },
      status: "ready",
      variant_key: "caption_heavy",
      version: 1
    }
  ]

  const tableSeeds = [
    client.from("owner_billing_accounts").upsert(
      {
        billing_country: "US",
        checkout_preference: "card_or_crypto",
        manual_invoice_allowed: false,
        owner_id: ownerId,
        stablecoin_eligible: true,
        stripe_customer_id: "cus_e2e_owner",
        stripe_default_payment_method_id: null,
        tax_exempt: false
      },
      { onConflict: "owner_id" }
    ),
    client.from("owner_subscriptions").upsert(
      {
        cancel_at_period_end: false,
        cancelled_at: null,
        current_period_end: currentPeriodEnd,
        current_period_start: currentPeriodStart,
        id: seedProjectIds.subscription,
        downgrade_to_plan_code: null,
        grace_period_ends_at: null,
        manual_payment_reference: null,
        metadata: {
          source: "playwright-e2e"
        },
        overage_cap_usd: 500,
        owner_id: ownerId,
        payment_failed_at: null,
        plan_code: "growth",
        provider: "system",
        status: "active"
      },
      { onConflict: "owner_id" }
    ),
    client.from("owner_guardrails").upsert(
      {
        auto_block_on_budget: true,
        max_concurrent_preview_jobs: 3,
        max_concurrent_render_jobs: 3,
        monthly_openai_budget_usd: 250,
        monthly_runway_budget_usd: 250,
        monthly_total_budget_usd: 500,
        owner_id: ownerId
      },
      { onConflict: "owner_id" }
    ),
    client.from("brand_kits").upsert(
      {
        id: seedProjectIds.accountBrandKit,
        is_default: true,
        logo_asset_id: null,
        name: "Seed Brand Kit",
        owner_id: ownerId,
        palette: {
          accent: "#f59e0b",
          background: "#0f172a",
          foreground: "#f8fafc",
          primary: "#f97316",
          secondary: "#22d3ee"
        },
        typography: {
          body_family: "IBM Plex Sans",
          body_weight: "400",
          heading_family: "Space Grotesk",
          headline_weight: "600",
          letter_spacing: "-0.02em"
        }
      },
      { onConflict: "id" }
    ),
    client.from("projects").upsert(
      {
        brand_kit_id: seedProjectIds.accountBrandKit,
        canonical_export_id: seedProjectIds.canonicalExport,
        id: seedProjectIds.project,
        name: "Seeded Sparkling Water Launch",
        owner_id: ownerId,
        selected_concept_id: seedProjectIds.concept,
        status: "export_ready",
        template_id: null
      },
      { onConflict: "id" }
    ),
    client.from("project_inputs").upsert(
      {
        aspect_ratio: "9:16",
        brand_tone: "Confident and modern",
        call_to_action: "Shop the launch",
        duration_seconds: 15,
        offer_text: "Limited launch bundle",
        owner_id: ownerId,
        product_description:
          "Sparkling botanical water with bright citrus flavor and premium cans.",
        product_name: "Luma Sparkling Water",
        project_id: seedProjectIds.project,
        target_audience: "Urban wellness shoppers",
        visual_style: "Premium studio lighting"
      },
      { onConflict: "project_id" }
    ),
    client.from("concepts").upsert(
      {
        angle: "Premium hydration with a launch-weekend offer",
        caption_style: "bold",
        hook: "A bright launch film for a wellness beverage drop.",
        id: seedProjectIds.concept,
        owner_id: ownerId,
        project_id: seedProjectIds.project,
        risk_flags: [],
        safety_notes: null,
        script:
          "Show premium can detail, bright citrus pour, and finish on a strong launch CTA.",
        sort_order: 0,
        status: "selected",
        title: "Launch-week premium spot",
        visual_direction: "Glossy studio macro shots",
        was_safety_modified: false
      },
      { onConflict: "id" }
    ),
    client.from("jobs").upsert(
      {
        attempts: 1,
        error: {},
        finished_at: nowIso,
        heartbeat_at: nowIso,
        id: seedProjectIds.job,
        max_attempts: 3,
        next_attempt_at: nowIso,
        owner_id: ownerId,
        payload: {
          batchId: seedProjectIds.renderBatch
        },
        project_id: seedProjectIds.project,
        provider: "runway",
        provider_job_id: "e2e-provider-job-main",
        result: {
          exportIds: [seedProjectIds.canonicalExport, seedProjectIds.secondaryExport]
        },
        scheduled_at: nowIso,
        started_at: nowIso,
        status: "succeeded",
        type: "render_final_ad"
      },
      { onConflict: "id" }
    ),
    client.from("assets").upsert(
      [
        {
          id: seedProjectIds.productAsset,
          kind: "product_image",
          metadata: {
            originalFileName: "seed-product.png",
            previewDataUrl: tinyPreviewDataUrl,
            sizeBytes: 2048,
            uploadStatus: "uploaded"
          },
          mime_type: "image/png",
          owner_id: ownerId,
          project_id: seedProjectIds.project,
          storage_key: "e2e/product-image.png"
        },
        {
          id: seedProjectIds.previewAsset,
          kind: "concept_preview",
          metadata: {
            conceptId: seedProjectIds.concept,
            previewDataUrl: tinyPreviewDataUrl,
            sizeBytes: 1024
          },
          mime_type: "image/png",
          owner_id: ownerId,
          project_id: seedProjectIds.project,
          storage_key: "e2e/concept-preview.png"
        },
        {
          id: seedProjectIds.videoLikeAsset,
          kind: "export_video",
          metadata: {
            previewDataUrl: tinyPreviewDataUrl,
            renderMode: "seeded-demo",
            sizeBytes: 4096
          },
          mime_type: "image/png",
          owner_id: ownerId,
          project_id: seedProjectIds.project,
          storage_key: "e2e/export-main.png"
        },
        {
          id: seedProjectIds.secondaryExportAsset,
          kind: "export_video",
          metadata: {
            previewDataUrl: tinyPreviewDataUrl,
            renderMode: "seeded-demo",
            sizeBytes: 4096
          },
          mime_type: "image/png",
          owner_id: ownerId,
          project_id: seedProjectIds.project,
          storage_key: "e2e/export-secondary.png"
        }
      ],
      { onConflict: "id" }
    ),
    client.from("render_batches").upsert(
      {
        aspect_ratios: ["9:16", "1:1"],
        concept_id: seedProjectIds.concept,
        decided_at: nowIso,
        export_count: sharedExportRows.length,
        finalization_note: null,
        finalized_at: null,
        finalized_by_owner_id: null,
        finalized_export_id: null,
        id: seedProjectIds.renderBatch,
        is_finalized: false,
        job_id: seedProjectIds.job,
        owner_id: ownerId,
        platform_preset: "instagram_reels",
        project_id: seedProjectIds.project,
        review_note: "Canonical export approved for external sharing.",
        status: "ready",
        variant_keys: ["default", "caption_heavy"],
        winner_export_id: seedProjectIds.canonicalExport
      },
      { onConflict: "id" }
    ),
    client.from("exports").upsert(sharedExportRows, { onConflict: "id" }),
    client.from("showcase_items").upsert(
      {
        export_id: seedProjectIds.canonicalExport,
        id: seedProjectIds.showcaseItem,
        is_published: true,
        owner_id: ownerId,
        project_id: seedProjectIds.project,
        render_batch_id: seedProjectIds.renderBatch,
        sort_order: 1,
        summary: "Seeded showcase item for public gallery smoke coverage.",
        title: "Seeded Sparkling Water Launch"
      },
      { onConflict: "id" }
    ),
    client.from("share_links").upsert(
      {
        export_id: seedProjectIds.canonicalExport,
        id: seedProjectIds.shareLink,
        is_active: true,
        owner_id: ownerId,
        project_id: seedProjectIds.project,
        token: seedTokens.share
      },
      { onConflict: "id" }
    ),
    client.from("share_campaigns").upsert(
      {
        export_id: seedProjectIds.canonicalExport,
        id: seedProjectIds.campaign,
        message: "Launch this creative in your next paid social burst.",
        owner_id: ownerId,
        project_id: seedProjectIds.project,
        render_batch_id: seedProjectIds.renderBatch,
        status: "active",
        title: "Seeded campaign launch page",
        token: seedTokens.campaign
      },
      { onConflict: "id" }
    ),
    client.from("batch_review_links").upsert(
      {
        id: seedProjectIds.reviewLink,
        message: "Please review the seeded batch and leave approval feedback.",
        owner_id: ownerId,
        project_id: seedProjectIds.project,
        render_batch_id: seedProjectIds.renderBatch,
        response_note: null,
        response_status: "pending",
        responded_at: null,
        reviewer_email: "stakeholder@example.com",
        reviewer_name: "Seeded Reviewer",
        reviewer_role: "stakeholder",
        status: "active",
        token: seedTokens.review
      },
      { onConflict: "id" }
    ),
    client.from("batch_review_comments").upsert(
      {
        author_label: "Creative Ops",
        body: "Seeded note: CTA timing looks ready for launch.",
        export_id: seedProjectIds.canonicalExport,
        id: seedProjectIds.reviewComment,
        owner_id: ownerId,
        project_id: seedProjectIds.project,
        render_batch_id: seedProjectIds.renderBatch,
        review_link_id: seedProjectIds.reviewLink,
        reviewer_role: "internal_reviewer"
      },
      { onConflict: "id" }
    ),
    client.from("delivery_workspaces").upsert(deliveryWorkspaces, { onConflict: "id" }),
    client.from("delivery_workspace_exports").upsert(
      [
        {
          delivery_workspace_id: seedProjectIds.deliveryPrimaryWorkspace,
          export_id: seedProjectIds.canonicalExport,
          id: "e2e-delivery-workspace-export-main",
          label: "Primary export",
          owner_id: ownerId,
          project_id: seedProjectIds.project,
          sort_order: 0
        },
        {
          delivery_workspace_id: seedProjectIds.deliveryPrimaryWorkspace,
          export_id: seedProjectIds.secondaryExport,
          id: "e2e-delivery-workspace-export-secondary",
          label: "Square export",
          owner_id: ownerId,
          project_id: seedProjectIds.project,
          sort_order: 1
        },
        {
          delivery_workspace_id: seedProjectIds.deliveryAcknowledgementWorkspace,
          export_id: seedProjectIds.canonicalExport,
          id: "e2e-delivery-workspace-export-ack",
          label: "Acknowledgement export",
          owner_id: ownerId,
          project_id: seedProjectIds.project,
          sort_order: 0
        }
      ],
      { onConflict: "id" }
    ),
    client.from("delivery_workspace_events").upsert(
      [
        {
          actor_label: "Creative Ops",
          created_at: nowIso,
          delivery_workspace_id: seedProjectIds.deliveryPrimaryWorkspace,
          event_type: "delivered",
          export_id: seedProjectIds.canonicalExport,
          id: "e2e-delivery-event-delivered",
          metadata: {
            note: "Seeded initial delivery event."
          },
          owner_id: ownerId,
          project_id: seedProjectIds.project
        },
        {
          actor_label: "Seeded Client",
          created_at: nowIso,
          delivery_workspace_id: seedProjectIds.deliveryPrimaryWorkspace,
          event_type: "viewed",
          export_id: seedProjectIds.canonicalExport,
          id: "e2e-delivery-event-viewed",
          metadata: {},
          owner_id: ownerId,
          project_id: seedProjectIds.project
        }
      ],
      { onConflict: "id" }
    ),
    client.from("usage_events").upsert(
      [
        {
          estimated_cost_usd: 0.42,
          event_type: "concept_generation",
          export_id: null,
          id: seedProjectIds.usageEventConcept,
          metadata: {
            source: "playwright-e2e"
          },
          owner_id: ownerId,
          project_id: seedProjectIds.project,
          provider: "openai",
          units: 1
        },
        {
          estimated_cost_usd: 1.35,
          event_type: "render_final_ad",
          export_id: seedProjectIds.canonicalExport,
          id: seedProjectIds.usageEventRender,
          metadata: {
            source: "playwright-e2e"
          },
          owner_id: ownerId,
          project_id: seedProjectIds.project,
          provider: "runway",
          units: 1
        }
      ],
      { onConflict: "id" }
    ),
    client.from("notifications").upsert(
      [
        {
          action_url: `/dashboard/exports/${seedProjectIds.canonicalExport}`,
          body: "The seeded launch export is ready for delivery and sharing.",
          export_id: seedProjectIds.canonicalExport,
          id: seedProjectIds.notification,
          job_id: seedProjectIds.job,
          kind: "export_ready",
          metadata: {
            source: "playwright-e2e"
          },
          owner_id: ownerId,
          project_id: seedProjectIds.project,
          read_at: null,
          severity: "success",
          title: "Seeded export ready"
        },
        {
          action_url: "/dashboard/delivery",
          body: "A seeded delivery workspace still needs follow-up.",
          export_id: seedProjectIds.canonicalExport,
          id: seedProjectIds.notificationSecondary,
          job_id: null,
          kind: "delivery_follow_up",
          metadata: {
            bucket: "due_today",
            source: "playwright-e2e"
          },
          owner_id: ownerId,
          project_id: seedProjectIds.project,
          read_at: null,
          severity: "warning",
          title: "Seeded delivery reminder"
        }
      ],
      { onConflict: "id" }
    ),
    client.from("billing_events").upsert(
      {
        event_occurred_at: nowIso,
        event_status: "processed",
        event_type: "subscription.seeded",
        id: "e2e-billing-event-main",
        owner_id: ownerId,
        payload: {
          source: "playwright-e2e"
        },
        processed_at: nowIso,
        provider: "system",
        provider_event_id: "evt_e2e_seeded_subscription",
        subscription_id: seedProjectIds.subscription,
        summary: "Seeded growth subscription for Playwright browser automation."
      },
      { onConflict: "id" }
    )
  ]

  const results = await Promise.all(tableSeeds)

  for (const result of results) {
    if (result.error) {
      throw result.error
    }
  }
}

export async function seedE2EFixtures() {
  const environment = await readSeedEnvironment()
  const client = createServiceRoleClient(environment)
  const owner = await ensureOwnerUser(client, environment)

  await purgeOwnerFixtureRows(client, owner.id)
  await seedTables(client, owner.id)
  await fs.mkdir(e2eGeneratedDirectory, { recursive: true })

  const manifest: E2EFixtureManifest = {
    campaignToken: seedTokens.campaign,
    deliveryAcknowledgementToken: seedTokens.deliveryAcknowledgement,
    deliveryExportId: seedProjectIds.canonicalExport,
    deliveryToken: seedTokens.delivery,
    exportId: seedProjectIds.canonicalExport,
    exportIds: [seedProjectIds.canonicalExport, seedProjectIds.secondaryExport],
    owner: {
      email: environment.E2E_OWNER_EMAIL,
      id: owner.id
    },
    projectId: seedProjectIds.project,
    renderBatchId: seedProjectIds.renderBatch,
    reviewToken: seedTokens.review,
    shareToken: seedTokens.share
  }

  await fs.writeFile(e2eFixtureManifestPath, JSON.stringify(manifest, null, 2))

  return {
    environment,
    manifest
  }
}
