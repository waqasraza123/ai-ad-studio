import type { MessageCatalog } from "../translator"

export const en = {
  "app.name": "AI Ad Studio",
  "app.description": "Premium AI product ad generation workflow",
  "common.language.english": "English",
  "common.language.arabic": "Arabic",
  "common.language.label": "Language",
  "common.language.switcherLabel": "Switch language",
  "common.theme.light": "Light mode",
  "common.theme.dark": "Dark mode",
  "common.theme.switchToLight": "Switch to light mode",
  "common.theme.switchToDark": "Switch to dark mode",
  "common.actions.create": "Create",
  "common.actions.save": "Save",
  "common.actions.submit": "Submit",
  "common.actions.cancel": "Cancel",
  "common.actions.close": "Close",
  "common.actions.open": "Open",
  "common.actions.backToDashboard": "Back to dashboard",
  "common.actions.tryAgain": "Try again",
  "common.actions.viewAll": "All",
  "common.status.pending": "Pending",
  "common.status.approved": "Approved",
  "common.status.rejected": "Rejected",
  "common.status.finalized": "Finalized",
  "common.status.unknownSize": "Unknown size",
  "common.words.when": "When",
  "common.words.provider": "Provider",
  "common.words.event": "Event",
  "common.words.events": "Events",
  "common.words.units": "Units",
  "common.words.estimatedCost": "Estimated cost",
  "common.words.kind": "Kind",
  "common.words.outputs": "Outputs",
  "common.words.reviewer": "Reviewer",
  "common.words.role": "Role",
  "common.words.responded": "Responded",
  "common.words.decision": "Decision",
  "common.words.decisionNote": "Decision note",
  "common.words.email": "Email",
  "common.words.password": "Password",
  "common.words.project": "Project",
  "common.words.label": "Label",
  "common.words.records": "Records",
  "common.words.impressions": "Impressions",
  "common.words.spend": "Spend",
  "common.words.roas": "ROAS",
  "common.words.created": "Created {{value}}",
  "common.words.updated": "Updated {{value}}",
  "common.words.notSet": "Not set",
  "common.words.unknownProject": "Unknown project",
  "common.count.projects": { one: "{{count}} project", other: "{{count}} projects" },
  "common.count.itemsShown": { one: "{{count}} shown", other: "{{count}} shown" },
  "header.marketing.workflow": "Workflow",
  "header.marketing.samples": "Samples",
  "header.marketing.plans": "Plans",
  "header.marketing.faq": "FAQ",
  "header.marketing.showcase": "Showcase",
  "header.marketing.signIn": "Sign in",
  "header.marketing.enterDashboard": "Enter dashboard",
  "header.app.workspace": "Workspace",
  "header.app.studioMode": "Studio mode",
  "header.app.workspaceDescription":
    "Structured AI ad generation with a focused workflow.",
  "header.app.renderProfile": "Render profile",
  "header.app.renderProfileTitle": "10s vertical ads",
  "header.app.renderProfileDescription":
    "3 concepts, 1 preview frame each, 1 final export.",
  "header.app.providerEyebrow": "Motion provider",
  "header.app.providerTitle": "Hosted provider path",
  "header.app.providerDescription":
    "Runway remains the fastest full-capability option. Use the runtime setup panel for hybrid and local HTTP guidance.",
  "header.app.studio": "Studio",
  "header.app.productionWorkspace": "Production workspace",
  "header.app.authNotConfigured": "Auth not configured",
  "header.app.signOut": "Sign out",
  "header.app.signingOut": "Signing out…",
  "header.app.nav.workspace": "Workspace",
  "header.app.nav.production": "Production",
  "header.app.nav.operations": "Operations",
  "header.app.nav.publishing": "Publishing",
  "header.app.nav.administration": "Administration",
  "header.app.nav.dashboard": "Dashboard",
  "header.app.nav.newProject": "New project",
  "header.app.nav.concepts": "Concepts",
  "header.app.nav.exports": "Exports",
  "header.app.nav.analytics": "Analytics",
  "header.app.nav.delivery": "Delivery",
  "header.app.nav.notifications": "Notifications",
  "header.app.nav.showcase": "Showcase",
  "header.app.nav.campaigns": "Campaigns",
  "header.app.nav.settings": "Settings",
  "public.header.backHome": "Back home",
  "public.header.dashboard": "Dashboard",
  "auth.title": "Authentication",
  "auth.heading": "Sign in to AI Ad Studio",
  "auth.description":
    "Authentication secures access to projects, concepts, exports, and other protected routes in the studio.",
  "auth.protectedAreaTitle": "Protected application area",
  "auth.protectedAreaDescription":
    "Dashboard routes are now gated by authenticated session checks when Supabase credentials are present.",
  "auth.runtimeTitle": "Runtime setup matters",
  "auth.runtimeDescription":
    "Runway is the recommended hosted path, while hybrid and local HTTP modes can be used when your machine or remote GPU environment is set up for them.",
  "auth.signInTitle": "Sign in",
  "auth.signInDescription": "Access the protected dashboard shell.",
  "auth.signInPending": "Signing in…",
  "auth.signInAction": "Sign in",
  "auth.signUpTitle": "Create account",
  "auth.signUpDescription": "Set up a local account to use the studio.",
  "auth.signUpPending": "Creating account…",
  "auth.signUpAction": "Create account",
  "auth.placeholders.email": "john@example.com",
  "auth.placeholders.password": "••••••••",
  "auth.placeholders.newPassword": "Create a password",
  "auth.demo.reveal": "Reveal demo sign-in",
  "auth.demo.access": "Demo access",
  "auth.demo.prefill": "Prefill demo credentials",
  "auth.demo.prefillDescription":
    "Prefills the demo administrator credentials on this page.",
  "auth.configuration.title": "Connect Supabase to prove auth end to end",
  "auth.configuration.description":
    "This repo now contains the auth integration points, protected route logic, and versioned schema files. Add your Supabase credentials locally to validate real sign-in and session flow.",
  "auth.configuration.dashboardTitle": "Auth is not configured in this environment",
  "auth.configuration.dashboardDescription":
    "Protected routes are wired. Add Supabase credentials locally to validate real sessions, redirects, and ownership-protected flows.",
  "marketing.hero.badge":
    "Public product workflow{{suffix}}",
  "marketing.hero.badgeSuffix": " • {{count}} live samples highlighted",
  "marketing.hero.title":
    "Turn product inputs into campaign-ready ad outputs with a controlled studio workflow",
  "marketing.hero.description":
    "AI Ad Studio helps marketing teams move from brief and product assets to concepts, previews, final exports, and public handoff surfaces without drifting into an open-ended editor.",
  "marketing.hero.outcomeWorkflow": "Constrained ad workflow",
  "marketing.hero.outcomeReview": "Review before final render",
  "marketing.hero.outcomeDelivery": "Ready for publish and delivery",
  "marketing.hero.browseShowcase": "Browse showcase",
  "marketing.hero.briefs": "Briefs",
  "marketing.hero.briefsValue": "Structured",
  "marketing.hero.briefsDescription":
    "Inputs stay constrained to product marketing work.",
  "marketing.hero.reviews": "Reviews",
  "marketing.hero.reviewsValue": "Before spend",
  "marketing.hero.reviewsDescription":
    "Preview concepts first, then commit to final render output.",
  "marketing.hero.delivery": "Delivery",
  "marketing.hero.deliveryValue": "Ready",
  "marketing.hero.deliveryDescription":
    "Promote winners to showcase, campaigns, and delivery surfaces.",
  "marketing.featureGrid.eyebrow": "Why it works",
  "marketing.featureGrid.title":
    "A productized workflow instead of an open-ended generation toy",
  "marketing.featureGrid.description":
    "Every surface in the product reinforces one constrained workflow, so the output stays easier to review, promote, and deliver.",
  "marketing.feature.constrained.title": "Constrained ad workflow",
  "marketing.feature.constrained.description":
    "The product is opinionated on purpose. Teams move through brief, concepts, previews, render, and promotion instead of editing from scratch.",
  "marketing.feature.review.title": "Review before final render spend",
  "marketing.feature.review.description":
    "The system exposes preview checkpoints first so stakeholders can compare viable directions before committing time and budget.",
  "marketing.feature.winner.title": "Winner promotion to public surfaces",
  "marketing.feature.winner.description":
    "Approved exports can graduate into public showcase and campaign surfaces without rebuilding presentation context somewhere else.",
  "marketing.feature.delivery.title": "Delivery and handoff readiness",
  "marketing.feature.delivery.description":
    "Finalized outputs support delivery workflows, client handoff, and shareable proof layers after the winner is locked.",
  "marketing.feature.inputs.title": "Built for product marketing inputs",
  "marketing.feature.inputs.description":
    "The workflow assumes real product assets, offers, CTAs, and template-driven styling rather than unrestricted creative exploration.",
  "marketing.feature.teams.title": "Designed for professional teams",
  "marketing.feature.teams.description":
    "The public site, dashboard, and publish surfaces all reinforce one product story: consistent ad output with cleaner operational control.",
  "dashboard.home.eyebrow": "Dashboard",
  "dashboard.home.title": "Project workspace is now active",
  "dashboard.home.description":
    "Create projects, save the creative brief, and register source assets before sending preview and motion jobs through the current hosted, hybrid, or local provider path that matches your runtime setup.",
  "dashboard.home.newProject": "New project",
  "dashboard.home.providerEyebrow": "Provider status",
  "dashboard.home.providerTitle": "Runway is the fastest hosted path",
  "dashboard.home.providerDescription":
    "Use the API & GPU setup entry in the sidebar to compare Runway, hybrid, and local HTTP modes before running previews or motion jobs.",
  "dashboard.admin.eyebrow": "Workspace administration",
  "dashboard.admin.title": "Keep billing, limits, and brand defaults in sync",
  "dashboard.admin.description":
    "Settings is now the home for commercial controls, operator safety caps, and the shared brand system that project templates inherit.",
  "dashboard.admin.openSettings": "Open settings",
  "dashboard.admin.unavailable":
    "Workspace administration details could not be loaded right now. Open Settings to retry.",
  "dashboard.admin.planLabel": "Plan",
  "dashboard.admin.guardrailsLabel": "Guardrails",
  "dashboard.admin.brandLabel": "Brand kit",
  "dashboard.admin.guardrailsSummary":
    "Preview {{preview}} • Render {{render}}",
  "dashboard.admin.brandSummary":
    "Heading {{heading}} • Body {{body}}",
  "dashboard.admin.brandUnavailable":
    "Default brand kit details are unavailable right now.",
  "projects.list.unavailableTitle": "Projects are temporarily unavailable",
  "projects.list.unavailableDescription":
    "We could not load your projects right now. This usually means a temporary backend or database issue. You can still create a new project and refresh this page again in a moment.",
  "projects.list.createNew": "Create new project",
  "projects.list.emptyTitle": "No projects yet",
  "projects.list.emptyDescription":
    "Create your first project to start the structured flow from product brief to concept generation and final export.",
  "projects.list.createFirst": "Create first project",
  "projects.list.openProject": "Open project",
  "projects.new.eyebrow": "New project",
  "projects.new.title": "Create the first working project flow",
  "projects.new.description":
    "This phase creates the real project spine. Start with a project name, then continue into the persisted brief and asset intake flow.",
  "projects.new.projectName": "Project name",
  "projects.new.placeholder": "Luxe serum launch",
  "projects.new.pending": "Creating project…",
  "projects.new.action": "Create project",
  "projects.new.redirectHint": "You will be redirected to the project detail workspace.",
  "projects.brief.eyebrow": "Project brief",
  "projects.brief.title":
    "Persist the inputs that will drive concept generation",
  "projects.brief.productName": "Product name",
  "projects.brief.callToAction": "Call to action",
  "projects.brief.productDescription": "Product description",
  "projects.brief.offerText": "Offer text",
  "projects.brief.targetAudience": "Target audience",
  "projects.brief.brandTone": "Brand tone",
  "projects.brief.visualStyle": "Visual style",
  "projects.brief.placeholder.productName": "HydraGlow Serum",
  "projects.brief.placeholder.callToAction": "Shop now",
  "projects.brief.placeholder.productDescription":
    "Describe the product clearly so the concept pipeline can build hooks, angles, and visual direction later.",
  "projects.brief.placeholder.offerText": "20 percent off launch week",
  "projects.brief.placeholder.targetAudience": "Skincare buyers 22 to 35",
  "projects.brief.placeholder.brandTone": "Premium and clean",
  "projects.brief.placeholder.visualStyle":
    "Minimal studio lighting with soft luxury feel",
  "projects.brief.pending": "Saving brief…",
  "projects.brief.action": "Save brief",
  "projects.assets.eyebrow": "Asset intake",
  "projects.assets.title": "Register source files for this project",
  "projects.assets.description":
    "This phase persists asset metadata and project association. Actual object storage upload wiring lands next without changing the page contract.",
  "projects.assets.selectFile": "Select file",
  "projects.assets.assetKind": "Asset kind",
  "projects.assets.assetKind.productImage": "Product image",
  "projects.assets.assetKind.logo": "Logo",
  "projects.assets.pending": "Uploading…",
  "projects.assets.action": "Register asset",
  "projects.assets.empty":
    "No assets registered yet. Add product images or a logo to prepare the project for the next phase.",
  "concepts.dashboard.emptyTitle": "No projects yet",
  "concepts.dashboard.emptyDescription":
    "Create a project first. Concepts, previews, and selection status will appear here once the project workspace starts moving.",
  "concepts.dashboard.eyebrow": "Concepts",
  "concepts.dashboard.title": "Cross-project concept queue",
  "concepts.dashboard.description":
    "Use this page to see which projects have drafted concepts, generated previews, and a selected direction. Open a project workspace to run concept jobs or change the selected concept.",
  "concepts.dashboard.summary.projectsInScope": "Projects in scope",
  "concepts.dashboard.summary.projectsWithConcepts": "Projects with concepts",
  "concepts.dashboard.summary.projectsWithPreviews": "Projects with previews",
  "concepts.dashboard.summary.projectsWithSelection": "Projects with selection",
  "concepts.dashboard.selectedConcept": "Selected concept",
  "concepts.dashboard.noSelectedConcept": "No concept selected yet",
  "concepts.dashboard.latestConcept": "Latest concept: {{value}}",
  "concepts.dashboard.noLatestConcept": "No concepts generated yet",
  "concepts.dashboard.openWorkspace": "Open project workspace",
  "concepts.dashboard.notGeneratedTitle": "Concepts have not been generated yet",
  "concepts.dashboard.notGeneratedDescription":
    "The current repo keeps concept generation in the project detail page. Open a workspace, save the brief, and trigger concept generation there.",
  "concepts.panel.generationEyebrow": "Concept generation",
  "concepts.panel.generationTitle": "Concept generation workflow",
  "concepts.panel.generationPending": "Generating concepts…",
  "concepts.panel.generationInProgress": "Concept generation in progress",
  "concepts.panel.generationAction": "Generate concepts",
  "concepts.panel.previewsEyebrow": "Concept previews",
  "concepts.panel.previewsTitle": "Visual concept previews",
  "concepts.panel.previewsPending": "Generating previews…",
  "concepts.panel.previewsBlocked": "Preview generation unavailable",
  "concepts.panel.previewsAction": "Generate previews",
  "concepts.list.emptyTitle": "No concepts yet",
  "concepts.list.emptyDescription":
    "Save the brief, queue a generation job, run the worker, and refresh this page to see the first concept set land here.",
  "concepts.card.previewPending": "Preview pending",
  "concepts.card.safetyReviewed": "Safety reviewed",
  "concepts.card.hook": "Hook",
  "concepts.card.script": "Script",
  "concepts.card.pendingSelection": "Saving selection…",
  "concepts.card.selected": "Selected concept",
  "concepts.card.select": "Select concept",
  "safety.title": "Safety summary",
  "safety.modified": "Adjusted for modest wording",
  "safety.noFlags": "No safety flags recorded.",
  "analytics.eyebrow": "Analytics",
  "analytics.title": "Provider usage and cost tracking",
  "analytics.description":
    "Track estimated provider cost per project and export, inspect usage events, and see which providers are driving spend.",
  "analytics.providerBreakdown": "Provider cost breakdown",
  "analytics.usageLedger": "Usage ledger",
  "analytics.projectBreakdown.eyebrow": "Project usage",
  "analytics.projectBreakdown.events": {
    one: "{{value}} usage event",
    other: "{{value}} usage events"
  },
  "analytics.overview.usageEvents": "Usage events",
  "analytics.overview.estimatedTotalCost": "Estimated total cost",
  "analytics.overview.trackedUnits": "Tracked units",
  "analytics.overview.projectsWithUsage": "Projects with usage",
  "analytics.creative.eyebrow": "Creative performance",
  "analytics.creative.title": "Activation outcomes and creative scorecards",
  "analytics.creative.description":
    "Track manual creative outcomes against real export lineage so the studio can learn which hooks, CTAs, and formats are producing the best results.",
  "analytics.creative.upgradeRequired":
    "Your current plan does not include creative performance analytics. Upgrade in Billing and plan.",
  "analytics.creative.empty":
    "No creative performance records have been ingested yet.",
  "analytics.creative.topExports": "Top exports and canonical winners",
  "analytics.creative.byHook": "Winning hooks",
  "analytics.creative.byCallToAction": "Winning CTAs",
  "analytics.creative.byAspectRatio": "Winning aspect ratios",
  "analytics.creative.recordCount": "{{count}} records",
  "analytics.creative.overview.impressions": "Impressions",
  "analytics.creative.overview.clicks": "Clicks",
  "analytics.creative.overview.spend": "Spend",
  "analytics.creative.overview.conversions": "Conversions",
  "analytics.creative.overview.roas": "ROAS",
  "analytics.creative.ingestion.eyebrow": "Manual ingestion",
  "analytics.creative.ingestion.description":
    "Submit campaign outcomes manually first. The system ties each record back to the real export, concept, preview, render batch, and canonical lineage.",
  "analytics.creative.ingestion.upgradeRequired":
    "Your current plan does not include creative performance ingestion. Upgrade in Billing and plan.",
  "analytics.creative.ingestion.empty":
    "Create exports first, then ingest their campaign outcomes here.",
  "analytics.creative.ingestion.impressions": "Impressions",
  "analytics.creative.ingestion.clicks": "Clicks",
  "analytics.creative.ingestion.spend": "Spend (USD)",
  "analytics.creative.ingestion.conversions": "Conversions",
  "analytics.creative.ingestion.conversionValue": "Conversion value (USD)",
  "analytics.creative.ingestion.accountLabel": "External account label",
  "analytics.creative.ingestion.notes": "Notes",
  "analytics.creative.ingestion.pending": "Recording performance…",
  "analytics.creative.ingestion.submit": "Record creative performance",
  "analytics.creative.ingestion.success":
    "Creative performance was recorded successfully.",
  "notifications.overview.total": "Total notifications",
  "notifications.overview.unread": "Unread",
  "notifications.overview.warnings": "Warnings",
  "notifications.overview.errors": "Errors",
  "errors.notFound.title": "Page not found",
  "errors.notFound.description":
    "The page you requested does not exist or is no longer available.",
  "errors.app.title": "Something went wrong",
  "errors.app.description":
    "Try again or return to the dashboard. If this keeps happening, check server logs.",
  "errors.dashboard.title": "Dashboard hit a snag",
  "errors.dashboard.description":
    "Try again or go back. Your session should still be active.",
  "public.showcase.eyebrow": "Public showcase",
  "public.showcase.title": "Generated ad gallery",
  "public.showcase.description":
    "Browse generated exports grouped by branded template, aspect ratio, and platform preset.",
  "public.showcase.empty": "No showcase items match the current filters.",
  "public.showcase.previewUnavailable": "Preview unavailable",
  "public.share.eyebrow": "Shared export",
  "public.share.description":
    "This is an owner-controlled single-export share link. It is separate from winner-only campaign pages and finalized delivery workspaces.",
  "public.campaign.eyebrow": "Public campaign",
  "public.review.eyebrow": "External batch review",
  "public.review.title": "Review outputs for {{projectName}}",
  "public.review.recordedTitle": "Thank you. Your decision is recorded.",
  "public.review.outcome": "Outcome: {{value}}.",
  "public.review.note": "Note: {{value}}",
  "public.review.submitPending": "Submitting…",
  "public.review.submit": "Submit decision",
  "public.review.placeholder":
    "Share why you approve or reject this batch",
  "public.review.decision.approve": "Approve",
  "public.review.decision.reject": "Reject",
  "public.delivery.eyebrow": "Delivery workspace",
  "public.delivery.recipientLabel": "Recipient label",
  "public.delivery.acknowledgementNote": "Acknowledgement note",
  "public.delivery.acknowledgementPending": "Submitting…",
  "public.delivery.placeholder.recipient": "Client name or team",
  "public.delivery.placeholder.note": "Optional acknowledgement or receipt note",
  "public.delivery.approvalSummary": "Approval summary",
  "public.delivery.reviewNote": "Review note",
  "public.delivery.noReviewNote": "No review note was recorded.",
  "public.delivery.finalDecision": "Final decision",
  "public.delivery.noFinalDecisionNote": "No final decision note was recorded.",
  "public.delivery.receiptStatus": "Receipt status",
  "public.delivery.receiptAcknowledged": "Receipt acknowledged",
  "public.delivery.receiptAcknowledgedBy": " by {{value}}.",
  "public.delivery.handoffNotes": "Handoff notes",
  "public.delivery.downloadableAssets": "Downloadable assets",
  "public.delivery.canonical": "Canonical",
  "public.delivery.downloadAsset": "Download asset",
  "branding.runway.eyebrow": "Runway integration",
  "branding.runway.title": "Hosted premium runtime",
  "branding.runway.description":
    "Runway is the fastest supported hosted path for premium previews and motion generation in the current studio workflow.",
  "branding.runway.logoAlt": "Runway logo",
  "branding.runway.visit": "Visit runwayml.com",
  "media.exportFrame.unavailable": "Export preview is not available yet.",
  "media.exportFrame.previewAlt": "Export preview for {{project}}",
  "media.exportFrame.loading": "Loading video preview",
  "media.exportFrame.error":
    "Could not load the video preview. Use the download action if it is available.",
  "showcase.publish.eyebrow": "Public showcase",
  "showcase.publish.ineligible":
    "Only reviewed winning exports can be published to the public showcase.",
  "showcase.publish.published":
    "This export is already live in the public showcase.",
  "showcase.publish.ready":
    "This winner is ready to be published to the showcase.",
  "showcase.publish.placeholder": "Optional gallery summary",
  "showcase.publish.pending": "Publishing…",
  "showcase.publish.action": "Publish to showcase",
  "showcase.publish.unpublishPending": "Unpublishing…",
  "showcase.publish.unpublishAction": "Unpublish showcase item",
  "exports.shareLink.eyebrow": "Share link",
  "exports.shareLink.description":
    "Create or refresh an owner-controlled utility link for this export.",
  "exports.shareLink.empty": "No share link has been created for this export yet.",
  "exports.shareLink.pending": "Updating link…",
  "exports.shareLink.reuse": "Reuse utility share link",
  "exports.shareLink.create": "Create utility share link",
  "campaigns.panel.eyebrow": "Share campaign",
  "campaigns.panel.ineligible":
    "Only reviewed winning exports can be promoted publicly.",
  "campaigns.panel.active": "A public campaign is active for this export.",
  "campaigns.panel.ready":
    "This winner is ready to be promoted as a public campaign.",
  "campaigns.panel.titlePlaceholder": "Campaign title",
  "campaigns.panel.messagePlaceholder": "Campaign message",
  "campaigns.panel.pending": "Creating campaign…",
  "campaigns.panel.create": "Create share campaign",
  "campaigns.panel.open": "Open public campaign",
  "campaigns.panel.archivePending": "Archiving…",
  "campaigns.panel.archive": "Archive share campaign",
  "delivery.activity.eyebrow": "Delivery activity",
  "delivery.activity.title": "Workspace activity timeline",
  "delivery.activity.delivered": "Delivered",
  "delivery.activity.viewed": "Viewed",
  "delivery.activity.downloaded": "Downloaded",
  "delivery.activity.acknowledged": "Acknowledged",
  "delivery.activity.lastViewed": "Last viewed",
  "delivery.activity.downloads": "Downloads",
  "delivery.activity.last": "Last: {{value}}",
  "delivery.activity.noRecipientLabel": "No recipient label",
  "delivery.activity.latestAcknowledgementNote": "Latest acknowledgement note",
  "delivery.activity.empty":
    "No delivery activity has been recorded for this workspace yet.",
  "delivery.activity.anonymousRecipient": "Anonymous recipient",
  "delivery.workspace.eyebrow": "Delivery workspace",
  "delivery.workspace.ineligible":
    "Only finalized canonical exports can be delivered publicly.",
  "delivery.workspace.titlePlaceholder": "Delivery title",
  "delivery.workspace.summaryPlaceholder": "Delivery summary",
  "delivery.workspace.handoffPlaceholder": "Owner-prepared handoff notes",
  "delivery.workspace.includedExports": "Included downloadable exports",
  "delivery.workspace.pending": "Saving…",
  "delivery.workspace.update": "Update delivery workspace",
  "delivery.workspace.create": "Create delivery workspace",
  "delivery.workspace.openPublic": "Open public delivery",
  "delivery.workspace.active": "Delivery workspace is active.",
  "delivery.workspace.publicUrl": "Public URL",
  "delivery.workspace.archivePending": "Archiving…",
  "delivery.workspace.archive": "Archive delivery workspace",
  "approvals.gate.eyebrow": "Approval gate",
  "approvals.gate.title": "Final render approval",
  "approvals.gate.description":
    "Expensive final renders require human approval before the worker can continue.",
  "approvals.gate.selectedConcept": "Selected concept",
  "approvals.gate.unknownConcept": "Unknown concept",
  "approvals.gate.noHook": "No hook available",
  "approvals.gate.decisionNote": "Decision note",
  "approvals.gate.approvalPlaceholder": "Optional approval note",
  "approvals.gate.approvePending": "Approving…",
  "approvals.gate.approveAction": "Approve render",
  "approvals.gate.rejectionPlaceholder": "Reason for rejection",
  "approvals.gate.rejectPending": "Rejecting…",
  "approvals.gate.rejectAction": "Reject render",
  "exports.detail.selectedConcept": "Selected concept",
  "exports.detail.variant": "Variant",
  "exports.detail.preset": "Preset",
  "exports.detail.aspectRatio": "Aspect ratio",
  "exports.detail.voiceover": "Voiceover",
  "exports.detail.estimatedCost": "Estimated cost",
  "exports.detail.artifactMode": "Artifact mode",
  "exports.detail.sceneCount": "Scene count",
  "exports.detail.captionCues": "Caption cues",
  "exports.detail.videoSpecs": "Video specs",
  "exports.detail.safetyNotes": "Safety notes",
  "exports.detail.unknownConcept": "Unknown concept",
  "exports.detail.notFound": "Not found",
  "exports.detail.unknown": "Unknown",
  "exports.detail.notAvailable": "n/a",
  "exports.detail.noSafetyNotes":
    "No additional safety notes were recorded.",
  "activation.panel.eyebrow": "Activation package",
  "activation.panel.description":
    "Prepare a channel-ready internal package for this finalized export. Packages stay audit-friendly and separate from direct external publishing.",
  "activation.panel.upgradeRequired":
    "Your current plan does not include activation package preparation. Upgrade in Billing and plan.",
  "activation.panel.ineligible":
    "Only the finalized canonical export can be prepared as an activation package.",
  "activation.panel.channelDescription":
    "Build a normalized manifest, asset bundle, and channel payload for internal preparation.",
  "activation.panel.pending": "Preparing package…",
  "activation.panel.prepareAction": "Prepare {{value}} package",
  "activation.panel.history": "Package history",
  "activation.panel.empty": "No activation packages have been prepared for this export yet.",
  "activation.panel.downloadManifest": "Download manifest",
  "activation.panel.readiness.ready": "Ready",
  "activation.panel.readiness.blocked": "Blocked",
  "activation.panel.status.ready": "Ready",
  "activation.panel.status.draft": "Draft",
  "activation.panel.status.superseded": "Superseded",
  "activation.panel.status.archived": "Archived",
  "activation.channel.meta": "Meta",
  "activation.channel.google": "Google",
  "activation.channel.tiktok": "TikTok",
  "activation.channel.internalHandoff": "Internal handoff",
  "activation.issue.exportNotReady": "The export is not ready yet.",
  "activation.issue.exportAssetMissing":
    "The rendered export asset is missing.",
  "activation.issue.exportNotFinalized":
    "Only the finalized canonical export can be prepared.",
  "promotion.eligibility.finalizedCanonicalOnly":
    "Only finalized canonical exports can be promoted publicly.",
  "promotion.eligibility.batchNotFound":
    "The review batch for this export was not found.",
  "promotion.eligibility.projectNotFound":
    "The project for this export was not found.",
  "promotion.eligibility.batchProjectMismatch":
    "The review batch for this export does not belong to this project.",
  "promotion.eligibility.finalizeWinnerFirst":
    "Finalize the reviewed winner before promoting it publicly.",
  "promotion.eligibility.notFinalizedCanonical":
    "Only the finalized canonical export can be promoted publicly.",
  "promotion.eligibility.notCurrentCanonical":
    "Only the current canonical export can be promoted publicly.",
  "projects.detail.processingNotice":
    "Background work is running or your latest export is still processing. This page refreshes every few seconds until things settle.",
  "projects.detail.eyebrow": "Project detail",
  "projects.detail.description":
    "This page includes reusable branded templates, expanded brand kits, approval gates, export management, platform-specific render packs, and controlled A/B variation batches.",
  "projects.workspaceMap.eyebrow": "Workspace map",
  "projects.workspaceMap.title": "Stay oriented while this project is in motion",
  "projects.workspaceMap.description":
    "{{value}} is one project workspace inside the wider studio. Billing, defaults, reporting, and cross-project surfaces stay one step away.",
  "projects.workspaceMap.stageBrief": "Brief and assets",
  "projects.workspaceMap.stageConcepts": "Concepts and previews",
  "projects.workspaceMap.stageRender": "Render and approval",
  "projects.workspaceMap.stageExport": "Exports and delivery",
  "projects.workspaceMap.jumpLabel": "Jump across the studio",
  "projects.workspaceMap.adminTitle": "Workspace administration still affects this project",
  "projects.workspaceMap.adminDescription":
    "Brand defaults, billing access, and operator guardrails now live inside Settings. Open the administration area any time without losing the project context.",
  "projects.workspaceMap.adminAction": "Open workspace administration",
  "projects.summary.eyebrow": "Project summary",
  "projects.summary.status": "Status",
  "projects.summary.assets": "Assets",
  "projects.summary.template": "Template",
  "projects.summary.brandKit": "Brand kit",
  "projects.summary.none": "None",
  "templates.panel.eyebrow": "Creative template",
  "templates.panel.title": "Branded style system",
  "templates.panel.description":
    "Templates provide reusable scene packs and CTA end-card styling that shape the render output.",
  "templates.panel.label": "Template",
  "templates.panel.pending": "Saving…",
  "templates.panel.save": "Save template",
  "brandKit.settings.eyebrow": "Default brand kit",
  "brandKit.settings.title": "Theme tokens",
  "brandKit.settings.name": "Brand kit name",
  "brandKit.settings.primaryColor": "Primary color",
  "brandKit.settings.secondaryColor": "Secondary color",
  "brandKit.settings.accentColor": "Accent color",
  "brandKit.settings.backgroundColor": "Background color",
  "brandKit.settings.foregroundColor": "Foreground color",
  "brandKit.settings.headingFamily": "Heading family",
  "brandKit.settings.bodyFamily": "Body family",
  "brandKit.settings.headlineWeight": "Headline weight",
  "brandKit.settings.bodyWeight": "Body weight",
  "brandKit.settings.letterSpacing": "Letter spacing",
  "brandKit.settings.pending": "Saving…",
  "brandKit.settings.save": "Save brand kit tokens",
  "settings.section.eyebrow": "Settings",
  "settings.section.title": "Workspace administration",
  "settings.section.description":
    "Review commercial access, operating limits, and the default brand system from one clean administration surface.",
  "settings.nav.label": "Settings sections",
  "settings.nav.overview": "Overview",
  "settings.nav.billing": "Billing",
  "settings.nav.guardrails": "Guardrails",
  "settings.nav.brand": "Brand kit",
  "settings.overview.billing.description":
    "Monitor your subscription state, billing period, checkout readiness, and plan capacity from one dedicated page.",
  "settings.overview.billing.statusReady": "Billing actions ready",
  "settings.overview.billing.statusLimited": "Needs attention",
  "settings.overview.billing.monthlyPrice": "Monthly price",
  "settings.overview.billing.currentPeriodEnd":
    "Current billing period ends {{value}}",
  "settings.overview.billing.storageCap": "Storage cap {{value}}",
  "settings.overview.billing.openAction": "Open billing",
  "settings.overview.guardrails.title": "Budget and concurrency caps",
  "settings.overview.guardrails.description":
    "Set personal ceilings that can only tighten your active subscription entitlements.",
  "settings.overview.guardrails.totalBudget": "Monthly total budget",
  "settings.overview.guardrails.providerBudgets":
    "OpenAI {{openai}} • Runway {{runway}}",
  "settings.overview.guardrails.concurrency":
    "Preview {{preview}} • Render {{render}}",
  "settings.overview.guardrails.openAction": "Open guardrails",
  "settings.overview.brand.description":
    "Keep the default palette and typography ready for project templates and future exports.",
  "settings.overview.brand.unavailable": "Default brand kit unavailable",
  "settings.overview.brand.palette": "Palette {{value}}",
  "settings.overview.brand.typography":
    "Heading {{heading}} • Body {{body}}",
  "settings.overview.brand.openAction": "Open brand kit",
  "settings.brand.unavailable":
    "A default brand kit is not available for this workspace right now.",
  "settings.billing.feedback.success":
    "Checkout started successfully. Complete payment in Stripe to activate the selected plan.",
  "settings.billing.feedback.cancelled":
    "Checkout was cancelled before payment was completed.",
  "settings.billing.feedback.portal":
    "Returned from the billing portal.",
  "settings.billing.unavailable.checkout":
    "Paid plan checkout is unavailable right now. Check Stripe billing runtime and try again.",
  "settings.billing.unavailable.planChange":
    "Paid plan changes are unavailable right now. Check Stripe pricing/runtime configuration and try again.",
  "settings.billing.unavailable.portal":
    "Billing portal actions are unavailable right now. Check Stripe billing runtime and try again.",
  "settings.billing.portal.action": "Manage payment method",
  "settings.billing.portal.pending": "Opening portal…",
  "settings.billing.purchase.checkoutPending": "Opening checkout…",
  "settings.billing.purchase.switchPending": "Switching plan…",
  "settings.billing.purchase.checkoutPill": "Checkout",
  "settings.billing.purchase.switchPill": "Switch plan",
  "settings.billing.purchase.fullCardHint":
    "Click anywhere on this plan card to continue.",
  "settings.billing.purchase.currentPill": "Current plan",
  "settings.billing.purchase.currentHint":
    "You are already on this plan. Choose another paid plan to change billing.",
  "settings.billing.purchase.downgradeOnlyPill": "Downgrade only",
  "settings.billing.purchase.downgradeOnlyHint":
    "Return to Free by canceling the current paid subscription at period end.",
  "settings.billing.purchase.unavailablePill": "Temporarily unavailable",
  "settings.billing.purchase.unavailableAction": "Unavailable",
  "settings.billing.purchase.checkoutAction": "Choose {{value}}",
  "settings.billing.purchase.switchAction": "Switch to {{value}}",
  "billing_checkout_unavailable":
    "Checkout is not configured right now. Add Stripe billing settings and try again.",
  "billing_plan_change_unavailable":
    "Plan changes are not available right now. Check Stripe billing setup and try again.",
  "billing_portal_unavailable":
    "Billing portal is not available for this account yet.",
  "activation_export_not_found":
    "The export could not be found for activation packaging.",
  "activation_export_not_finalized":
    "Only the finalized canonical export can be prepared as an activation package.",
  "activation_package_failed":
    "The activation package could not be prepared. Try again.",
  "billing_upgrade_required_activation":
    "Your current plan does not include activation packages. Upgrade in Billing and plan.",
  "billing_upgrade_required_creative_performance":
    "Your current plan does not include creative performance ingestion and analytics. Upgrade in Billing and plan.",
  "creative_performance_invalid":
    "The creative performance record is invalid. Check the metrics and try again.",
  "creative_performance_export_not_found":
    "The selected export could not be found for creative performance tracking.",
  "creative_performance_package_not_found":
    "The selected activation package could not be found for this export.",
  "theme.palette.eyebrow": "Theme palette",
  "theme.palette.auto": "Auto cycling",
  "theme.palette.pinned": "Pinned",
  "theme.palette.currentMode": "Currently tuned for {{value}} mode.",
  "theme.palette.switchAria": "Switch site palette to {{value}}",
  "theme.palette.helper":
    "Palette controls the accent family. The top-bar switch controls light and dark mode.",
  "theme.palette.resumeAuto": "Resume auto",
  "theme.palette.name.emberMagma": "Ember Magma",
  "theme.palette.name.electricCyan": "Electric Cyan",
  "theme.palette.name.acidLime": "Acid Lime",
  "theme.palette.name.crimsonFuchsia": "Crimson Fuchsia",
  "theme.palette.name.cobaltViolet": "Cobalt Violet",
  "theme.palette.description.emberMagma":
    "Orange heat and pink flare over obsidian glass.",
  "theme.palette.description.electricCyan":
    "Neon cyan and aqua over deep midnight navy.",
  "theme.palette.description.acidLime":
    "High-voltage chartreuse on dark carbon.",
  "theme.palette.description.crimsonFuchsia":
    "Hot magenta and crimson with luxe dark contrast.",
  "theme.palette.description.cobaltViolet":
    "Cobalt blue punched with electric violet.",
  "runtime.setup": "Runtime setup",
  "runtime.setupHelp": "Setup help",
  "runtime.apiGpuSetup": "API & GPU setup",
  "runtime.launcherDescription":
    "See the recommended API path, local GPU requirements, and ready-to-use `.env.local` blocks.",
  "runtime.modal.title": "Runtime setup",
  "runtime.modal.description":
    "API, GPU, and env guidance for the current supported provider paths",
  "runtime.modal.close": "Close runtime setup modal",
  "header.app.signedInFallback": "Signed in",
  "marketing.heroPreview.system": "Studio system",
  "marketing.heroPreview.systemDescription":
    "One approved package carries through publish and handoff.",
  "marketing.heroPreview.reviewFirst": "Review first",
  "marketing.heroPreview.canonicalExport": "Canonical export",
  "marketing.heroPreview.canonicalWinner": "Canonical winner",
  "marketing.heroPreview.readyToPublish": "Ready to publish",
  "marketing.heroPreview.packageTitle": "Approved campaign package",
  "marketing.heroPreview.packageDescription":
    "One winner moves into showcase and delivery unchanged.",
  "marketing.heroPreview.lockedDescription":
    "Winner locked across publish and handoff.",
  "marketing.heroPreview.packageMeta.formats": "Formats",
  "marketing.heroPreview.packageMeta.formatsValue": "9:16, 1:1, 16:9",
  "marketing.heroPreview.packageMeta.review": "Review",
  "marketing.heroPreview.packageMeta.reviewValue": "Owner + external",
  "marketing.heroPreview.packageMeta.surfaces": "Surfaces",
  "marketing.heroPreview.packageMeta.surfacesValue": "Showcase + delivery",
  "marketing.heroPreview.checkpoints": "Key checkpoints",
  "marketing.heroPreview.stepsCount": "3 steps",
  "marketing.heroPreview.steps.brief.label": "Brief",
  "marketing.heroPreview.steps.brief.title": "Lock the request",
  "marketing.heroPreview.steps.brief.detail":
    "Goals, assets, and constraints are set.",
  "marketing.heroPreview.steps.review.label": "Review",
  "marketing.heroPreview.steps.review.title": "Choose the winner",
  "marketing.heroPreview.steps.review.detail":
    "Teams approve preview-ready frames.",
  "marketing.heroPreview.steps.publish.label": "Publish",
  "marketing.heroPreview.steps.publish.title": "Ship the canonical export",
  "marketing.heroPreview.steps.publish.detail":
    "Showcase and delivery stay aligned.",
  "marketing.workflow.eyebrow": "Workflow",
  "marketing.workflow.title": "A professional path from brief to approved output",
  "marketing.workflow.description":
    "The homepage should make the product shape obvious: this is a constrained ad-generation system for marketing teams, not a general-purpose editing canvas.",
  "marketing.workflow.steps.brief.title": "Frame the campaign brief",
  "marketing.workflow.steps.brief.description":
    "Bring product inputs, offer, CTA, and visual direction into one controlled ad brief.",
  "marketing.workflow.steps.generate.title": "Generate viable directions",
  "marketing.workflow.steps.generate.description":
    "Produce constrained concepts with hooks, scripts, and visual direction instead of open-ended creative drift.",
  "marketing.workflow.steps.review.title": "Review before you spend",
  "marketing.workflow.steps.review.description":
    "Screen polished previews first so teams can pick a winner before final rendering.",
  "marketing.workflow.steps.publish.title": "Publish and hand off",
  "marketing.workflow.steps.publish.description":
    "Promote the winning export into campaign, showcase, and delivery surfaces with less manual cleanup.",
  "marketing.showcase.eyebrow": "Samples",
  "marketing.showcase.title": "Real output proof, not placeholder product claims",
  "marketing.showcase.description":
    "The homepage should be backed by real showcase output whenever it exists. When it does not, the section still holds the layout with designed sample placeholders rather than fake testimonials or invented case studies.",
  "marketing.showcase.exploreFull": "Explore full showcase",
  "marketing.showcase.viewInShowcase": "View in showcase",
  "marketing.showcase.publishNote":
    "Publish approved winners to populate this proof layer automatically.",
  "marketing.showcase.fallback.one.title": "Flagship launch preview",
  "marketing.showcase.fallback.one.summary":
    "Cinematic premium reveal pacing for a flagship product drop.",
  "marketing.showcase.fallback.one.tagOne": "9:16",
  "marketing.showcase.fallback.one.tagTwo": "Launch creative",
  "marketing.showcase.fallback.one.tagThree": "Premium cinematic",
  "marketing.showcase.fallback.two.title": "Offer-focused campaign cut",
  "marketing.showcase.fallback.two.summary":
    "Fast offer-led motion designed for a promo campaign and CTA-heavy rollout.",
  "marketing.showcase.fallback.two.tagOne": "1:1",
  "marketing.showcase.fallback.two.tagTwo": "Promo push",
  "marketing.showcase.fallback.two.tagThree": "Offer-led ad",
  "marketing.showcase.fallback.three.title": "Minimal product story",
  "marketing.showcase.fallback.three.summary":
    "A calmer product story layout for brands that want cleaner composition and softer motion.",
  "marketing.showcase.fallback.three.tagOne": "16:9",
  "marketing.showcase.fallback.three.tagTwo": "Brand story",
  "marketing.showcase.fallback.three.tagThree": "Minimal modern",
  "marketing.pricing.eyebrow": "Plans",
  "marketing.pricing.title": "A concise pricing snapshot built from live plan data",
  "marketing.pricing.description":
    "The homepage should help teams understand value shape quickly without collapsing into a full billing settings experience.",
  "marketing.pricing.recommended": "Recommended",
  "marketing.pricing.workflowEyebrow": "Start from the workflow",
  "marketing.pricing.workflowTitle":
    "Pricing should support the product story, not replace it.",
  "marketing.pricing.enterDashboard": "Enter dashboard",
  "marketing.pricing.free": "Free",
  "marketing.pricing.perMonth": "/mo",
  "marketing.pricing.conceptsPerMonth": "{{count}} concepts / month",
  "marketing.pricing.previewsPerMonth": "{{count}} previews / month",
  "marketing.pricing.rendersPerMonth": "{{count}} render batches / month",
  "marketing.pricing.exportsPerMonth": "{{count}} exports / month",
  "marketing.pricing.publishing.full":
    "Showcase, campaign, and delivery publishing",
  "marketing.pricing.publishing.delivery": "Delivery publishing included",
  "marketing.pricing.publishing.limited": "Limited public publishing",
  "marketing.pricing.publishing.internal": "Internal workflow only",
  "marketing.pricing.unavailableEyebrow": "Live catalog unavailable",
  "marketing.pricing.unavailableTitle": "Pricing data is temporarily unavailable",
  "marketing.pricing.unavailableDescription":
    "The workflow and product surface are still available, but live plan data could not be loaded right now. Open the dashboard after billing runtime access is restored to inspect the current catalog.",
  "marketing.faq.eyebrow": "FAQ",
  "marketing.faq.title": "The main objections should be answered on the page",
  "marketing.faq.finalCtaEyebrow": "Final CTA",
  "marketing.faq.finalCtaTitle":
    "Move from product brief to approved ad output without turning the workflow into chaos",
  "marketing.faq.finalCtaDescription":
    "The homepage now ends where it should: a clear path into the product and a proof surface for teams that want to inspect output quality first.",
  "marketing.faq.enterDashboard": "Enter dashboard",
  "marketing.faq.browseShowcase": "Browse showcase",
  "marketing.faq.questions.ads.question": "What kind of ads does this create?",
  "marketing.faq.questions.ads.answer":
    "AI Ad Studio is built for product marketing ads: concept generation, preview review, final exports, and public handoff surfaces.",
  "marketing.faq.questions.editor.question": "Is this a general-purpose editor?",
  "marketing.faq.questions.editor.answer":
    "No. The workflow is intentionally constrained so teams can move through a repeatable path instead of managing a blank-canvas editor.",
  "marketing.faq.questions.review.question":
    "Can teams review outputs before final rendering?",
  "marketing.faq.questions.review.answer":
    "Yes. The workflow includes preview checkpoints so teams can compare outputs before committing to final rendering.",
  "marketing.faq.questions.surfaces.question":
    "What public surfaces exist after approval?",
  "marketing.faq.questions.surfaces.answer":
    "Approved winners can move into public showcase, campaign, delivery, and lighter share-link surfaces depending on plan access.",
  "runtime.launcher.sidebarEyebrow": "Setup help",
  "runtime.modes.runway.label": "Runway only",
  "runtime.modes.runway.eyebrow": "Recommended",
  "runtime.modes.runway.summary": "Full hosted premium path",
  "runtime.modes.runway.detail":
    "Use Runway for both preview images and scene-video generation when you want the fastest supported path to the intended studio experience.",
  "runtime.modes.runway.highlight":
    "Best full-capability path on Intel Macs and other non-GPU setups.",
  "runtime.modes.runway.compatibility": "Hosted path",
  "runtime.modes.runway.noteOne":
    "Buy a Runway API plan, then add RUNWAYML_API_SECRET to .env.local.",
  "runtime.modes.runway.noteTwo":
    "Leave both providers set to runway for the cleanest hosted setup.",
  "runtime.modes.hybrid.label": "Hybrid",
  "runtime.modes.hybrid.eyebrow": "Advanced",
  "runtime.modes.hybrid.summary": "Runway previews + local scene video",
  "runtime.modes.hybrid.detail":
    "Keep previews on Runway while routing scene-video generation to the local HTTP sidecar for a lower-cost mixed runtime path.",
  "runtime.modes.hybrid.highlight":
    "Lowest-risk GPU validation path once a supported Linux + NVIDIA box is available.",
  "runtime.modes.hybrid.compatibility": "Hosted + local",
  "runtime.modes.hybrid.noteOne":
    "Buy Runway, add RUNWAYML_API_SECRET, then switch only SCENE_VIDEO_PROVIDER to local_http.",
  "runtime.modes.hybrid.noteTwo":
    "Run the local inference sidecar on a practical Linux + NVIDIA environment.",
  "runtime.modes.local.label": "Fully local",
  "runtime.modes.local.eyebrow": "Power user",
  "runtime.modes.local.summary": "Hardware-dependent full local stack",
  "runtime.modes.local.detail":
    "Use the local sidecar for both previews and scene video when you control the Python, CUDA, model, and GPU environment end to end.",
  "runtime.modes.local.highlight":
    "Practical only on supported Linux + NVIDIA hardware for full scene-video generation.",
  "runtime.modes.local.compatibility": "Local GPU",
  "runtime.modes.local.noteOne":
    "Choose LOCAL_IMAGE_MODEL and LOCAL_VIDEO_MODEL based on the GPU tier you actually have.",
  "runtime.modes.local.noteTwo":
    "Treat CPU-only or Intel Mac scene-video as impractical rather than a supported target.",
  "runtime.modes.mock.label": "Lightweight dev",
  "runtime.modes.mock.eyebrow": "Secondary",
  "runtime.modes.mock.summary": "Mock previews + local scene video",
  "runtime.modes.mock.detail":
    "Use mock preview generation when you want to exercise parts of the workflow without paying for hosted preview images.",
  "runtime.modes.mock.highlight":
    "Useful for UI and job-flow development, not for proving premium output quality.",
  "runtime.modes.mock.compatibility": "Dev/testing",
  "runtime.modes.mock.noteOne":
    "Mock mode is a workflow aid, not a production-quality render path.",
  "runtime.modes.mock.noteTwo":
    "Additional provider adapters may be added later; today the supported runtime paths are Runway, local HTTP inference, and mock preview mode.",
  "runtime.machine.hosted.label": "Hosted / recommended",
  "runtime.machine.hosted.summary":
    "Paid Runway for both previews and scene video.",
  "runtime.machine.hosted.detail":
    "Fastest full-capability path with no local GPU dependency.",
  "runtime.machine.hybrid.label": "Hybrid / advanced",
  "runtime.machine.hybrid.summary":
    "Runway previews plus local scene video sidecar.",
  "runtime.machine.hybrid.detail":
    "Best mixed setup once you have a supported remote GPU box.",
  "runtime.machine.local.label": "Local / experimental",
  "runtime.machine.local.summary":
    "Linux + NVIDIA required for practical full local video.",
  "runtime.machine.local.detail":
    "Treat Intel Macs and CPU-only boxes as preview-only, mock, or unsupported for scene video.",
  "runtime.runwayUpgrade.title": "What changes after buying Runway",
  "runtime.runwayUpgrade.description":
    "Buying Runway changes your environment setup, not the product workflow. Add your key, keep previews on Runway, and decide whether scene video stays hosted or moves to a supported local sidecar.",
  "runtime.runwayUpgrade.stepOne":
    "Buy a Runway API plan and generate a secret key.",
  "runtime.runwayUpgrade.stepTwo":
    "Add RUNWAYML_API_SECRET to .env.local.",
  "runtime.runwayUpgrade.stepThree":
    "Set PREVIEW_PROVIDER=runway and choose whether SCENE_VIDEO_PROVIDER stays runway or switches to local_http for hybrid mode.",
  "runtime.runwayUpgrade.stepFour":
    "Adjust RUNWAY_IMAGE_MODEL or RUNWAY_VIDEO_MODEL if you want to test a different hosted model.",
  "runtime.modal.heroPill":
    "Connect the right runtime to unlock full ad generation",
  "runtime.modal.heroTitle":
    "Choose the fastest path to full previews, motion, and delivery.",
  "runtime.modal.heroDescription":
    "AI Ad Studio can run in hosted, hybrid, or local modes. Today the supported runtime paths are Runway, local HTTP inference, and mock preview mode. If you are on an Intel MacBook Pro, treat hosted Runway as the supported full-capability path.",
  "runtime.modal.workerExportLabel":
    "After editing `.env.local`, export it before starting the worker.",
  "runtime.modal.shellSession": "Shell session",
  "runtime.modal.supportedModesEyebrow": "Supported runtime modes",
  "runtime.modal.supportedModesTitle":
    "Edit `.env.local` with the mode you actually want to test.",
  "runtime.modal.openConfig": "Open config",
  "runtime.modal.editEnv": "Edit your `.env.local`",
  "runtime.modal.copyEnvBlock": "Copy env block",
  "runtime.modal.copied": "Copied",
  "runtime.modal.currentSupportOnly": "Current support only",
  "runtime.modal.whyThisMode": "Why this mode",
  "runtime.modal.additionalSupportNote":
    "Additional provider adapters may be added later; today the supported runtime paths are Runway, local HTTP inference, and mock preview mode.",
  "runtime.modal.footerDescription":
    "Choose a mode, update `.env.local`, then export it into the worker shell before running jobs.",
  "runtime.modal.backToWorkspace": "Back to workspace",
  "runtime.modal.enterDashboard": "Enter dashboard",
  "runtime.modal.viewGuide": "View setup guide",
  "runtime.modal.dismiss": "Dismiss",
  "debug.jobs.eyebrow": "Debug jobs",
  "debug.jobs.title": "Failed jobs, traces, and retry controls",
  "debug.jobs.description":
    "Inspect every async job, drill into payload traces, and safely retry failed runs.",
  "debug.jobs.empty": "No jobs yet.",
  "debug.jobs.unknownProject": "Unknown project",
  "debug.jobs.attempts": "attempts {{current}}/{{max}}",
  "debug.jobs.traceTimeline": "Trace timeline",
  "debug.jobs.traceHeading": "Step-level job traces",
  "debug.jobs.traceEmpty": "No trace entries recorded for this job yet.",
  "debug.jobs.detail.description":
    "Inspect payloads, provider metadata, queue timing, errors, and use safe controls for cancellation or retry.",
  "debug.jobs.detail.openProject": "Open project",
  "debug.jobs.detail.cancelling": "Cancelling…",
  "debug.jobs.detail.cancel": "Cancel job",
  "debug.jobs.detail.retrying": "Retrying…",
  "debug.jobs.detail.retry": "Retry job",
  "debug.jobs.detail.attempts": "Attempts",
  "debug.jobs.detail.started": "Started",
  "debug.jobs.detail.finished": "Finished",
  "debug.jobs.detail.nextAttempt": "Next attempt",
  "debug.jobs.detail.cancelRequested": "Cancel requested",
  "debug.jobs.detail.providerJobId": "Provider job id",
  "debug.jobs.detail.payload": "Payload",
  "debug.jobs.detail.result": "Result",
  "debug.jobs.detail.error": "Error",
  "debug.jobs.detail.notAvailable": "n/a",
  "debug.jobs.status.queued": "Queued",
  "debug.jobs.status.running": "Running",
  "debug.jobs.status.waiting_provider": "Waiting on provider",
  "debug.jobs.status.succeeded": "Succeeded",
  "debug.jobs.status.failed": "Failed",
  "debug.jobs.status.cancelled": "Cancelled",
  "exports.status.queued": "Queued, waiting for the render worker",
  "exports.status.rendering": "Rendering, composing your ad",
  "exports.status.ready": "Ready, export complete",
  "exports.status.failed": "Failed, check jobs or retry",
  "exports.summary.eyebrow": "Export detail",
  "exports.summary.status": "Status",
  "exports.summary.checkingUpdates": "Checking for updates…",
  "exports.summary.created": "Created",
  "exports.summary.openVideoAsset": "Open video asset",
  "exports.dashboard.empty":
    "No exports yet. Render a project to start building export history.",
  "exports.dashboard.eyebrow": "Project exports",
  "exports.dashboard.unknownProject": "Unknown project",
  "exports.dashboard.generatedCount": {
    one: "{{count}} export generated",
    other: "{{count}} exports generated"
  },
  "exports.dashboard.latestAspectRatio": "Latest {{value}}",
  "notifications.empty": "No notifications yet.",
  "notifications.read": "Read",
  "notifications.unread": "Unread",
  "notifications.open": "Open",
  "notifications.updating": "Updating…",
  "notifications.markRead": "Mark as read",
  "notifications.severity.info": "Info",
  "notifications.severity.success": "Success",
  "notifications.severity.warning": "Warning",
  "notifications.severity.error": "Error",
  "public.review.comments.eyebrow": "Review activity",
  "public.review.comments.title": "Comments and decisions",
  "public.review.comments.empty": "No comments yet.",
  "public.review.comments.export": "Export",
  "public.review.comments.batchWide": "Batch-wide",
  "public.review.grid.empty":
    "No exports are available for this review link yet.",
  "public.review.grid.previewUnavailable": "Preview unavailable",
  "public.review.grid.currentWinner": "Current internal winner",
  "public.review.grid.locked":
    "Comments are locked because this review is closed.",
  "public.review.grid.yourName": "Your name",
  "public.review.grid.commentPlaceholder": "Comment on this export",
  "public.review.grid.posting": "Posting comment…",
  "public.review.grid.commentAction": "Comment on this output",
  "campaigns.list.empty": "No share campaigns yet.",
  "campaigns.list.unknownProject": "Unknown project",
  "campaigns.list.openPublicPage": "Open public page",
  "campaigns.list.openExport": "Open export",
  "projects.exports.eyebrow": "Project exports",
  "projects.exports.title": "Export history and format shortcuts",
  "projects.exports.empty":
    "No exports for this project yet. Render the project to create downloadable outputs.",
  "projects.exports.latestAspectRatio": "Latest {{value}}",
  "renders.reviewGrid.empty": "No exports found for this batch yet.",
  "renders.reviewGrid.previewUnavailable": "Preview unavailable",
  "renders.reviewGrid.canonicalExport": "Canonical export",
  "renders.reviewGrid.winner": "Winner",
  "renders.reviewGrid.locked":
    "Winner selection is locked because this batch has been finalized.",
  "renders.reviewGrid.openExport": "Open export",
  "renders.reviewGrid.notePlaceholder": "Decision note for this batch",
  "renders.reviewGrid.saving": "Saving…",
  "renders.reviewGrid.saveWinnerNote": "Save winner note",
  "renders.reviewGrid.selectWinner": "Select as winner",
  "renders.reviewSummary.eyebrow": "Batch review",
  "renders.reviewSummary.title": "Compare outputs and choose a winner",
  "renders.reviewSummary.description":
    "Review all outputs from this controlled batch side by side, store a decision note, and mark one export as the winner.",
  "renders.reviewSummary.backToProject": "Back to project",
  "renders.reviewSummary.project": "Project",
  "renders.reviewSummary.status": "Status",
  "renders.reviewSummary.preset": "Preset",
  "renders.reviewSummary.outputs": "Outputs",
  "renders.reviewSummary.reviewed": "Reviewed",
  "renders.reviewSummary.currentWinner": "Current winner",
  "renders.reviewSummary.noWinner": "No winner selected yet",
  "renders.reviewSummary.canonicalExport": "Canonical export",
  "renders.reviewSummary.notFinalized": "Not finalized",
  "renders.reviewSummary.approved": "Approved",
  "renders.reviewSummary.rejected": "Rejected",
  "renders.reviewSummary.pendingLinks": "Pending links",
  "renders.reviewSummary.decisionNote": "Decision note",
  "renders.reviewSummary.noDecisionNote": "No decision note yet.",
  "renders.reviewSummary.finalDecision": "Final decision",
  "renders.reviewSummary.notFinalizedNote": "Batch is not finalized yet.",
  "renders.reviewSummary.finalized": "finalized {{value}}",
  "renders.reviewSummary.closedLinks": "closed links {{count}}",
  "renders.batchPanel.eyebrow": "Variation batch",
  "renders.batchPanel.title": "Controlled A/B render run",
  "renders.batchPanel.description":
    "Generate multiple controlled variants from the selected concept in one approved render run.",
  "renders.batchPanel.selectedConcept": "Selected concept",
  "renders.batchPanel.selectConceptFirst": "Select a concept first",
  "renders.batchPanel.platformPreset": "Platform preset",
  "renders.batchPanel.aspectRatios": "Aspect ratios",
  "renders.batchPanel.controlledVariants": "Controlled variants",
  "renders.batchPanel.variant.default": "Default",
  "renders.batchPanel.variant.captionHeavy": "Caption heavy",
  "renders.batchPanel.variant.ctaHeavy": "CTA heavy",
  "renders.batchPanel.starting": "Starting batch…",
  "renders.batchPanel.startAction": "Start variation batch",
  "renders.batchPanel.empty": "No render batches yet.",
  "renders.batchPanel.winnerSelected": "winner selected",
  "renders.batchPanel.canonicalLocked": "canonical locked",
  "renders.batchPanel.exportsCount": "exports {{count}}",
  "renders.batchPanel.finalized": "finalized {{value}}",
  "renders.batchPanel.openReview": "Open review",
  "renders.links.eyebrow": "External reviewers",
  "renders.links.title": "Client review links",
  "renders.links.description":
    "Invite clients or stakeholders to review this batch through a public link with approve, reject, and comment actions.",
  "renders.links.reviewerName": "Reviewer name",
  "renders.links.reviewerEmail": "Reviewer email",
  "renders.links.reviewerRole": "Reviewer role",
  "renders.links.message": "Message",
  "renders.links.client": "Client",
  "renders.links.stakeholder": "Stakeholder",
  "renders.links.internalReviewer": "Internal reviewer",
  "renders.links.messageDefault":
    "Please review the batch outputs and leave your decision.",
  "renders.links.creating": "Creating link…",
  "renders.links.create": "Create review link",
  "renders.links.finalizedFrozen":
    "This batch is finalized. External review is frozen and new review links can no longer be created.",
  "renders.links.empty": "No external review links yet.",
  "renders.links.noEmail": "No email provided",
  "renders.links.created": "created {{value}}",
  "renders.links.responded": "responded {{value}}",
  "renders.links.open": "Open review link",
  "renders.links.revoking": "Revoking…",
  "renders.links.revoke": "Revoke",
  "renders.commentsPanel.eyebrow": "Review activity",
  "renders.commentsPanel.title": "External comments and decisions",
  "renders.commentsPanel.empty": "No external review activity yet.",
  "renders.commentsPanel.batchWide": "Batch-wide",
  "renders.commentsPanel.unknownExport": "Unknown export",
  "renders.finalize.eyebrow": "Final decision",
  "renders.finalize.lockedTitle": "Canonical export locked",
  "renders.finalize.lockedDescription":
    "This batch is finalized. External review is frozen and the canonical export is now used for future public promotion.",
  "renders.finalize.finalizedExport": "Finalized export",
  "renders.finalize.unknownExport": "Unknown export",
  "renders.finalize.finalizedAt": "Finalized at",
  "renders.finalize.reviewState": "Review state",
  "renders.finalize.locked": "Locked",
  "renders.finalize.note": "Finalization note",
  "renders.finalize.noNote": "No finalization note was added.",
  "renders.finalize.openCanonical": "Open canonical export",
  "renders.finalize.title": "Lock reviewed winner",
  "renders.finalize.description":
    "Finalizing this batch freezes public review and marks the winning export as the canonical asset for campaigns and showcase.",
  "renders.finalize.selectedWinner": "Selected winner",
  "renders.finalize.chooseWinnerFirst": "Choose a winner first",
  "renders.finalize.placeholder":
    "Why this export is the final canonical decision",
  "renders.finalize.pending": "Finalizing…",
  "renders.finalize.action": "Finalize canonical export",
  "delivery.followUp.none": "No owner follow-up",
  "delivery.followUp.needs_follow_up": "Needs follow-up",
  "delivery.followUp.reminder_scheduled": "Reminder scheduled",
  "delivery.followUp.waiting_on_client": "Waiting on client",
  "delivery.followUp.resolved": "Resolved",
  "delivery.reminderBucket.none": "No reminder date",
  "delivery.reminderBucket.overdue": "Overdue",
  "delivery.reminderBucket.due_today": "Due today",
  "delivery.reminderBucket.upcoming": "Upcoming",
  "delivery.reminderSupportFilter.all": "All recent",
  "delivery.reminderSupportFilter.checkpoint_mismatch": "Checkpoint mismatches",
  "delivery.reminderSupportFilter.workspace_missing": "Missing workspaces",
  "delivery.reminderSupportFilter.overdue": "Overdue reminders",
  "delivery.supportActivityFilter.all": "All support events",
  "delivery.supportActivityFilter.reminder_repairs": "Reminder repairs",
  "delivery.supportActivityFilter.failed_reminder_repairs":
    "Failed reminder repairs",
  "delivery.supportActivityFilter.support_handoff_notes":
    "Support handoff notes",
  "delivery.mismatch.filter.all": "All lifecycle buckets",
  "delivery.mismatch.filter.unresolved": "Unresolved mismatches",
  "delivery.mismatch.filter.resolved": "Resolved mismatches",
  "delivery.mismatch.filter.failed_reopen_attempts":
    "Failed reopen attempts",
  "delivery.page.eyebrow": "Delivery",
  "delivery.page.title": "Finalized client delivery workspaces",
  "delivery.page.description":
    "Delivery pages are only available for finalized canonical exports.",
  "delivery.page.focusedReminderVisible":
    "Reminder mismatch context is highlighted inside the workspace follow-up form below.",
  "delivery.page.focusedReminderHidden":
    "The reminder mismatch workspace is not visible under the current delivery filters.",
  "delivery.page.focusedWorkspaceVisible":
    "The workspace opened from reminder support is highlighted in the delivery workspace list below.",
  "delivery.page.focusedWorkspaceHidden":
    "The workspace opened from reminder support is not visible under the current delivery filters.",
  "delivery.page.emptyLifecycle":
    "No workspace activity matches the current reminder mismatch lifecycle filter under the current delivery support scope.",
  "delivery.page.emptySupportAll":
    "No support-originated workspace activity is visible under the current delivery filters.",
  "delivery.page.emptySupportFiltered":
    "No workspace activity matches the current support activity filter under the current delivery filters.",
  "delivery.dashboardSummary.eyebrow": "Delivery KPIs",
  "delivery.dashboardSummary.title": "Owner-side delivery overview",
  "delivery.dashboardSummary.description":
    "Durable delivery metrics derived from workspace activity events across {{count}} workspaces.",
  "delivery.dashboardSummary.activeWorkspaces": "Active workspaces",
  "delivery.dashboardSummary.acknowledged": "Acknowledged",
  "delivery.dashboardSummary.needsFollowUp": "Needs follow-up",
  "delivery.dashboardSummary.totalDownloads": "Total downloads",
  "delivery.overdue.eyebrow": "Overdue reminders",
  "delivery.overdue.title": "Delivery follow-up requiring immediate attention",
  "delivery.overdue.description":
    "Reminder-scheduled workspaces whose follow-up date has already passed.",
  "delivery.overdue.count": "{{count}} overdue",
  "delivery.overdue.empty": "No overdue delivery follow-up right now.",
  "delivery.overdue.nextOwnerContext": "Next owner context",
  "delivery.overdue.due": "due {{value}}",
  "delivery.overdue.latestActivity": "latest activity {{value}}",
  "delivery.overdue.followUpUpdated": "follow-up updated {{value}}",
  "delivery.overdue.openCanonical": "Open canonical export",
  "delivery.overdue.openDelivery": "Open delivery page",
  "delivery.queue.eyebrow": "Follow-up queue",
  "delivery.queue.title": "Unresolved delivery follow-up",
  "delivery.queue.description":
    "Active delivery workspaces that still need owner attention, ordered by reminder urgency and then latest client activity.",
  "delivery.queue.count": "{{count}} in queue",
  "delivery.queue.overdue": "Overdue {{count}}",
  "delivery.queue.dueToday": "Due today {{count}}",
  "delivery.queue.upcoming": "Upcoming {{count}}",
  "delivery.queue.empty": "No unresolved delivery follow-up right now.",
  "delivery.queue.nextOwnerContext": "Next owner context",
  "delivery.queue.latestActivity": "latest activity {{value}}",
  "delivery.queue.viewed": "viewed {{value}}",
  "delivery.queue.downloads": "downloads {{count}}",
  "delivery.queue.followUpUpdated": "follow-up updated {{value}}",
  "delivery.queue.reminderDue": "reminder due {{value}}",
  "delivery.queue.openCanonical": "Open canonical export",
  "delivery.queue.openDelivery": "Open delivery page",
  "delivery.support.eyebrow": "Internal support view",
  "delivery.support.title": "Recent delivery reminder notifications",
  "delivery.support.description":
    "Compare the last reminder notification with the current workspace checkpoint state.",
  "delivery.support.shown": "{{count}} shown",
  "delivery.support.totalRecent": "{{count}} total recent",
  "delivery.support.inSync": "{{count}} in sync",
  "delivery.support.resolved": "{{count}} resolved",
  "delivery.support.mismatch": "{{count}} mismatch",
  "delivery.support.missingWorkspace": "{{count}} missing workspace",
  "delivery.support.showingAll": "Showing all recent reminder notifications.",
  "delivery.support.showingOnly": "Showing only {{value}}.",
  "delivery.support.noRecent": "No recent delivery reminder notifications yet.",
  "delivery.support.noMatch":
    "No reminder notifications match the current filter: {{value}}.",
  "delivery.support.notificationCard": "Reminder notification",
  "delivery.support.currentCheckpointCard": "Current workspace checkpoint",
  "delivery.support.kind": "Kind",
  "delivery.support.reminderDueOn": "Reminder due on",
  "delivery.support.workspaceId": "Workspace id",
  "delivery.support.openWorkspace": "Open workspace in delivery dashboard",
  "delivery.support.openFollowUp":
    "Open follow-up form with reminder context",
  "delivery.support.followUpDueOn": "Follow-up due on",
  "delivery.support.lastNotificationBucket": "Last notification bucket",
  "delivery.support.lastNotificationDate": "Last notification date",
  "delivery.support.workspaceNotFound":
    "The workspace referenced by this notification could not be resolved from the current delivery workspace list.",
  "delivery.support.checkpointState.inSync": "Checkpoint in sync",
  "delivery.support.checkpointState.resolved": "Mismatch resolved",
  "delivery.support.checkpointState.mismatch": "Checkpoint mismatch",
  "delivery.support.checkpointState.workspaceMissing": "Workspace missing",
  "delivery.supportActivity.title": "Support-originated workspace activity",
  "delivery.supportActivity.description":
    "Filter workspace timelines to reminder repairs, failed reminder repairs, or support handoff notes.",
  "delivery.supportActivity.count":
    "{{count}} support events in current dashboard scope",
  "delivery.supportOps.title": "Support operations snapshot",
  "delivery.supportOps.description":
    "Counts below reflect the current delivery filters and the active support activity filter:",
  "delivery.supportOps.visibleWorkspaces": "{{count}} visible workspaces",
  "delivery.supportOps.visibleScope.title": "Visible support scope",
  "delivery.supportOps.visibleScope.description":
    "Workspaces currently visible under the active support activity scope.",
  "delivery.supportOps.failedRepairs.title": "Failed reminder repairs",
  "delivery.supportOps.failedRepairs.description":
    "Visible workspaces with at least one failed reminder repair event.",
  "delivery.supportOps.handoffNotes.title": "Support handoff notes",
  "delivery.supportOps.handoffNotes.description":
    "Visible workspaces with at least one recent support handoff note.",
  "delivery.supportOps.unresolved.title": "Unresolved mismatches",
  "delivery.supportOps.unresolved.description":
    "Visible workspaces that still have unresolved reminder checkpoint mismatches.",
  "delivery.mismatch.title": "Reminder mismatch lifecycle",
  "delivery.mismatch.description":
    "Counts below reflect the current delivery scope and active support activity filter:",
  "delivery.mismatch.visibleWorkspaces": "{{count}} visible workspaces",
  "delivery.mismatch.unresolved.title": "Unresolved mismatches",
  "delivery.mismatch.unresolved.description":
    "Visible reminder support records still treated as unresolved mismatches.",
  "delivery.mismatch.resolved.title": "Resolved mismatches",
  "delivery.mismatch.resolved.description":
    "Visible reminder support records already marked as resolved.",
  "delivery.mismatch.reopened.title": "Reopened mismatches",
  "delivery.mismatch.reopened.description":
    "Visible mismatch-reopen lifecycle activity entries that succeeded.",
  "delivery.mismatch.failedReopen.title": "Failed reopen attempts",
  "delivery.mismatch.failedReopen.description":
    "Visible mismatch-reopen lifecycle activity entries that failed.",
  "delivery.workspaceList.controlsEyebrow": "Overview controls",
  "delivery.workspaceList.controlsDescription":
    "Review delivery workspaces by current status, receipt activity, or latest activity recency.",
  "delivery.workspaceList.status.all": "All",
  "delivery.workspaceList.status.active": "Active",
  "delivery.workspaceList.status.archived": "Archived",
  "delivery.workspaceList.activity.all": "All activity",
  "delivery.workspaceList.activity.needsFollowUp": "Needs follow-up",
  "delivery.workspaceList.activity.acknowledged": "Acknowledged",
  "delivery.workspaceList.activity.viewedOnly": "Viewed only",
  "delivery.workspaceList.activity.downloaded": "Downloaded",
  "delivery.workspaceList.sort.latestActivity": "Latest activity",
  "delivery.workspaceList.sort.newest": "Newest",
  "delivery.workspaceList.showingSummary":
    "Showing {{shown}} of {{total}} delivery workspaces.",
  "delivery.workspaceList.showMore": "Show {{count}} more",
  "delivery.workspaceList.showAll": "Show all",
  "delivery.workspaceList.collapse": "Collapse list",
  "delivery.workspaceList.empty":
    "No delivery workspaces match the current filters.",
  "delivery.workspaceList.focusedFromSupport": "Focused from reminder support",
  "delivery.workspaceList.activityExcerptLabel": "Activity excerpt",
  "delivery.workspaceList.activityExcerpt.acknowledgedBy":
    "Acknowledged by {{value}}.",
  "delivery.workspaceList.activityExcerpt.acknowledged":
    "Acknowledged by recipient.",
  "delivery.workspaceList.activityExcerpt.downloadedOnce":
    "Downloaded once. Awaiting acknowledgement.",
  "delivery.workspaceList.activityExcerpt.downloadedMany":
    "Downloaded {{count}} times. Awaiting acknowledgement.",
  "delivery.workspaceList.activityExcerpt.viewed":
    "Viewed by recipient. Awaiting acknowledgement.",
  "delivery.workspaceList.activityExcerpt.delivered":
    "Delivered. Awaiting first recipient activity.",
  "delivery.workspaceList.activityExcerpt.none": "No recipient activity yet.",
  "delivery.workspaceList.recipientHint":
    "Recipient activity was detected but this workspace has not been acknowledged yet. Add a follow-up state or note to track the next owner action.",
  "delivery.workspaceList.followUpFocused":
    "Follow-up form focused from reminder mismatch",
  "delivery.workspaceList.ownerFollowUp": "Owner follow-up",
  "delivery.workspaceList.followUpState": "Follow-up state",
  "delivery.workspaceList.reminderDate": "Reminder date",
  "delivery.workspaceList.ownerNote": "Owner note",
  "delivery.workspaceList.ownerNotePlaceholder":
    "Add the next owner action, outreach note, or reminder context",
  "delivery.workspaceList.saveFollowUp": "Save follow-up",
  "delivery.workspaceList.saving": "Saving…",
  "delivery.workspaceList.updated": "updated {{value}}",
  "delivery.workspaceList.due": "due {{value}}",
  "delivery.workspaceList.delivered": "Delivered",
  "delivery.workspaceList.viewed": "Viewed",
  "delivery.workspaceList.downloaded": "Downloaded",
  "delivery.workspaceList.last": "last {{value}}",
  "delivery.workspaceList.acknowledged": "Acknowledged",
  "delivery.workspaceList.noRecipientLabel": "No recipient label",
  "delivery.workspaceList.created":
    "created {{created}} · latest activity {{latest}}",
  "delivery.workspaceList.openCanonical": "Open canonical export",
  "delivery.workspaceList.openDelivery": "Open delivery page",
  "delivery.followUpContext.title": "Reminder context",
  "delivery.followUpContext.reminderDueOn": "Reminder due on",
  "delivery.followUpContext.notificationId": "Notification id",
  "delivery.followUpContext.formDescription":
    "This follow-up form is focused from a reminder checkpoint mismatch row. You can repair reminder scheduling here without leaving the current workspace view.",
  "delivery.followUpContext.resolvedBanner":
    "This reminder mismatch is currently marked as resolved for this notification context.",
  "delivery.followUpContext.reopenNoteLabel":
    "Optional mismatch reopen note",
  "delivery.followUpContext.reopenNotePlaceholder":
    "Optional context explaining why the resolved mismatch should be reopened.",
  "delivery.followUpContext.reopenAction": "Reopen mismatch",
  "delivery.followUpContext.resolutionNoteLabel":
    "Optional mismatch resolution note",
  "delivery.followUpContext.resolutionNotePlaceholder":
    "Optional context explaining why this mismatch is considered resolved.",
  "delivery.followUpContext.resolveAction": "Mark mismatch as resolved",
  "delivery.followUpContext.rescheduleTomorrow": "Reschedule for tomorrow",
  "delivery.followUpContext.clearReasonLabel":
    "Reason for clearing reminder scheduling",
  "delivery.followUpContext.clearReasonPlaceholder":
    "Explain why reminder scheduling should be cleared.",
  "delivery.followUpContext.clearReasonHelp":
    "This reason is required and will be written into the delivery activity audit trail.",
  "delivery.followUpContext.clearAction": "Clear reminder scheduling",
  "delivery.repairOutcome.action.rescheduleTomorrow":
    "Rescheduled for tomorrow",
  "delivery.repairOutcome.action.clearReminderScheduling":
    "Cleared reminder scheduling",
  "delivery.repairOutcome.success": "{{action}} for workspace {{workspace}}.",
  "delivery.repairOutcome.successWithNote":
    "{{action}} for workspace {{workspace}}. Support handoff note saved to the activity timeline.",
  "delivery.repairOutcome.error.reasonRequired":
    "Clear reminder scheduling requires an explicit operator reason.",
  "delivery.repairOutcome.error.reasonTooLong":
    "Clear reason must be {{count}} characters or fewer.",
  "delivery.repairOutcome.error.handoffNoteTooLong":
    "Support handoff note must be {{count}} characters or fewer.",
  "delivery.repairOutcome.error.generic":
    "Could not complete {{action}} for workspace {{workspace}}.",
  "delivery.focusedStatus.title": "Focused workspace status",
  "delivery.focusedStatus.description":
    "Current state snapshot for the workspace pinned in this investigation view.",
  "delivery.focusedStatus.followUpStatus": "Follow-up status",
  "delivery.focusedStatus.followUpDueDate": "Follow-up due date",
  "delivery.focusedStatus.lastCheckpoint": "Last reminder checkpoint",
  "delivery.focusedStatus.latestSupportEvent": "Latest support event",
  "delivery.focusedStatus.noReminderCheckpoint": "No reminder checkpoint",
  "delivery.focusedStatus.unknownCheckpoint": "Unknown checkpoint",
  "delivery.focusedStatus.checkpointWithDate": "{{bucket}} on {{date}}",
  "delivery.focusedStatus.checkpointDateOnly": "Checkpoint date {{date}}",
  "delivery.focusedStatus.resolvedReminderMismatch":
    "Resolved reminder mismatch",
  "delivery.focusedStatus.supportHandoffNote": "Support handoff note",
  "delivery.focusedStatus.failedReminderRepair": "Failed reminder repair",
  "delivery.focusedStatus.reminderRepair": "Reminder repair",
  "delivery.focusedStatus.noSupportEvent": "No support event",
  "delivery.investigationView.title": "Investigation view",
  "delivery.investigationView.description":
    "Save or share this exact support investigation state as a single delivery dashboard URL.",
  "delivery.investigationView.open": "Open shareable view",
  "delivery.investigationView.copy": "Copy shareable link",
  "delivery.investigationView.copied": "Copied link",
  "delivery.investigationView.clear": "Clear pinned context",
  "delivery.investigationView.empty":
    "No pinned investigation context yet. Apply support filters or focus a workspace to generate a shareable investigation view.",
  "delivery.investigationView.summary.supportActivity":
    "Support activity: {{value}}",
  "delivery.investigationView.summary.mismatchLifecycle":
    "Mismatch lifecycle: {{value}}",
  "delivery.investigationView.summary.reminderSupport":
    "Reminder support: {{value}}",
  "delivery.investigationView.summary.focusedWorkspace":
    "Focused workspace: {{value}}",
  "delivery.investigationView.summary.focusedFollowUpForm":
    "Focused follow-up form",
  "delivery.investigationView.summary.focusedReminder":
    "Focused reminder: {{value}}",
  "delivery.investigationContext.eyebrow": "Why this view matters",
  "delivery.investigationContext.bucket.dueToday": "Due today",
  "delivery.investigationContext.bucket.overdue": "Overdue",
  "delivery.investigationContext.bucket.unspecified": "Unspecified bucket",
  "delivery.investigationContext.bucketDescription.dueToday": "due today",
  "delivery.investigationContext.bucketDescription.overdue": "overdue",
  "delivery.investigationContext.bucketDescription.unspecified": "unspecified",
  "delivery.investigationContext.noRecordedCheckpoint":
    "no recorded reminder checkpoint",
  "delivery.investigationContext.checkpoint.withDate":
    "{{bucket}} on {{date}}",
  "delivery.investigationContext.checkpoint.withNoDate":
    "{{bucket}} with no checkpoint date",
  "delivery.investigationContext.checkpoint.unknownBucket":
    "unknown bucket on {{date}}",
  "delivery.investigationContext.followUp.unknown": "unknown",
  "delivery.investigationContext.followUp.withDate":
    "{{status}} on {{date}}",
  "delivery.investigationContext.failedRepair.reasonRequired":
    "because clear reminder scheduling required an explicit operator reason",
  "delivery.investigationContext.failedRepair.reasonTooLong":
    "because the clear reason exceeded the allowed length",
  "delivery.investigationContext.failedRepair.disallowedWording":
    "because the submitted wording was not allowed",
  "delivery.investigationContext.failedRepair.unchanged":
    "and left the follow-up state unchanged",
  "delivery.investigationContext.failedRepair.badge":
    "Failed reminder repair",
  "delivery.investigationContext.failedRepair.title":
    "Why this view matters: {{workspace}} has a failed reminder repair",
  "delivery.investigationContext.failedRepair.description":
    "The latest support repair for {{workspace}} tried to {{action}} from {{bucket}} reminder context {{reason}}. Current follow-up state is {{status}}.",
  "delivery.investigationContext.resolved.badge": "Resolved mismatch",
  "delivery.investigationContext.resolved.title":
    "Why this view matters: {{workspace}} has a resolved reminder mismatch",
  "delivery.investigationContext.resolved.description":
    "The focused reminder notification for {{workspace}} was marked as resolved from the workspace view. Current follow-up state is {{status}}.",
  "delivery.investigationContext.unresolved.badge": "Unresolved mismatch",
  "delivery.investigationContext.unresolved.title":
    "Why this view matters: {{workspace}} still has an unresolved reminder mismatch",
  "delivery.investigationContext.unresolved.description":
    "The focused reminder notification for {{workspace}} is still out of sync with the current workspace checkpoint. The reminder was sent for {{bucket}} context, but the workspace currently shows {{checkpoint}}. Current follow-up state is {{status}}.",
  "delivery.investigationContext.notificationBadge": "Notification {{id}}",
  "delivery.investigationStale.eyebrow": "Investigation context warning",
  "delivery.investigationStale.keepFilters":
    "Keep filters and clear focus",
  "delivery.investigationStale.reset": "Reset to base delivery scope",
  "delivery.investigationStale.followUp.badge": "Stale follow-up context",
  "delivery.investigationStale.followUp.title":
    "Focused follow-up context is outside the current visible support scope",
  "delivery.investigationStale.followUp.description":
    "The investigation view is still pinned to a focused follow-up form, but that workspace is no longer visible in the current support scope. Keep the current filters and clear the stale focus, or reset to the base delivery scope.",
  "delivery.investigationStale.reminder.badge": "Stale reminder context",
  "delivery.investigationStale.reminder.title":
    "Focused reminder is outside the current visible reminder support scope",
  "delivery.investigationStale.reminder.description":
    "The investigation view is still pinned to a reminder notification, but that reminder no longer appears inside the current visible reminder support scope. This usually happens after reminder support filters or support activity filters change.",
  "delivery.investigationStale.workspace.badge": "Stale workspace focus",
  "delivery.investigationStale.workspace.title":
    "Focused workspace is outside the current visible support activity scope",
  "delivery.investigationStale.workspace.description":
    "The investigation view is still pinned to a workspace that is no longer visible under the current support activity scope. Keep the current filters and clear the stale focus, or reset to the base delivery scope.",
  "delivery.investigationStale.workspaceBadge": "Workspace {{value}}",
  "delivery.investigationStale.missingWorkspaceBadge":
    "Missing workspace focus",
  "delivery.investigationStale.reminderIdBadge": "Reminder {{value}}",
  "auth_unconfigured": "Auth is not configured yet.",
  "auth_credentials_required": "Email and password are required.",
  "auth_sign_in_failed": "Unable to sign in with those credentials.",
  "auth_sign_up_failed": "Unable to create account right now.",
  "auth_sign_up_confirmation_sent":
    "Account created. Check your email if confirmation is enabled.",
  "format.kb": "{{value}} KB",
  "format.mb": "{{value}} MB"
} satisfies Record<string, string | { one?: string; other: string }>

export type AppMessageKey = keyof typeof en
export type AppMessageCatalog = Record<AppMessageKey, MessageCatalog[AppMessageKey]>
