import { MODEST_WORDING_ERROR_MESSAGE } from "@/lib/modest-wording/index"
import type { Translator } from "@/lib/i18n/translator"

/** Short codes in URL `?error=` — mapped to user-facing copy (never throw from actions for expected cases). */
export const FORM_ERROR_MESSAGES: Record<string, string> = {
  auth_required: "You must be signed in to continue.",
  content_not_allowed: MODEST_WORDING_ERROR_MESSAGE,
  name_required: "Enter a project name (2–100 characters).",
  name_invalid: "Enter a project name (2–100 characters).",
  brief_invalid: "One or more brief fields are invalid. Check field lengths and try again.",
  project_not_found: "Project could not be found.",
  not_found: "That item could not be found.",
  asset_no_file: "Select a file before uploading.",
  asset_invalid: "That file type or size is not allowed.",
  r2_unconfigured: "File storage is not configured for uploads.",
  r2_upload_failed: "Upload failed. Try again.",
  template_required: "Choose a template.",
  brand_kit_required: "Choose a brand kit.",
  template_not_found: "That template is no longer available.",
  brand_kit_not_found: "That brand kit is no longer available.",
  reviewer_name_required: "Enter a reviewer name before creating a link.",
  batch_finalized: "This batch is finalized and cannot be changed.",
  batch_not_found: "Render batch could not be found.",
  review_link_not_found: "That review link could not be found.",
  review_link_inactive: "That review link is no longer active.",
  review_response_invalid: "Choose approve or reject before submitting.",
  comment_required: "Enter a comment before posting.",
  render_batch_locked: "This batch is finalized.",
  server_error: "Something went wrong. Try again.",
  select_concept_first: "Select a concept before rendering.",
  previews_required: "Generate concept previews before rendering.",
  concept_not_found: "Selected concept is missing.",
  save_brief_first: "Save the project brief before generating concepts.",
  concepts_first: "Generate concepts before creating previews.",
  select_concept_batch: "Select a concept before starting a variation batch.",
  previews_batch: "Generate concept previews before starting a variation batch.",
  job_failed: "That action could not be completed. Try again.",
  winner_export_invalid: "That export is not part of this batch.",
  finalize_failed: "Could not finalize this batch. Check that a winner is selected.",
  promotion_ineligible: "This export is not eligible for that action yet.",
  export_not_found: "Export could not be found.",
  campaign_not_found: "Share campaign could not be found.",
  showcase_not_found: "Showcase item could not be found.",
  approval_not_found: "Approval record could not be found.",
  share_link_failed: "Could not create or update the share link.",
  billing_project_limit_reached:
    "Your plan has reached its active project limit. Upgrade in Billing and plan to create another project.",
  billing_concept_limit_reached:
    "Your plan has reached its monthly concept-generation limit. Upgrade in Billing and plan to continue.",
  billing_preview_limit_reached:
    "Your plan has reached its monthly preview-generation limit. Upgrade in Billing and plan to continue.",
  billing_render_batch_limit_reached:
    "Your plan has reached its monthly render-batch limit. Upgrade in Billing and plan to continue.",
  billing_export_limit_reached:
    "Your plan has reached its monthly final export limit. Reduce batch size or upgrade in Billing and plan.",
  billing_storage_limit_reached:
    "Your plan has reached its storage limit. Remove assets or upgrade in Billing and plan.",
  billing_overage_cap_reached:
    "Your account has reached its monthly overage cap. Upgrade or wait for the next billing period.",
  billing_upgrade_required_showcase:
    "Your current plan does not include public showcase publishing. Upgrade in Billing and plan.",
  billing_upgrade_required_campaign:
    "Your current plan does not include public campaign publishing. Upgrade in Billing and plan.",
  billing_upgrade_required_delivery:
    "Your current plan does not include delivery workspace publishing. Upgrade in Billing and plan.",
  billing_upgrade_required_external_review:
    "Your current plan does not include external batch review links. Upgrade in Billing and plan.",
  provider_cost_ceiling_reached:
    "Generation is paused because your personal or operator safety budget ceiling has been reached.",
  monthly_overage_cap_reached:
    "Generation is paused because your monthly overage cap has been reached.",
  subscription_payment_required:
    "Generation is paused until the subscription payment issue is resolved.",
  subscription_grace_period_expired:
    "Generation is paused because the subscription grace period has expired.",
  billing_generation_blocked:
    "Generation is currently blocked by your billing state. Review Billing and plan.",
  billing_checkout_unavailable:
    "Checkout is not configured right now. Add Stripe billing settings and try again.",
  billing_plan_change_unavailable:
    "Plan changes are not available right now. Check Stripe billing setup and try again.",
  billing_portal_unavailable:
    "Billing portal is not available for this account yet.",
  billing_plan_change_failed:
    "The plan change could not be completed. Check billing setup and try again.",
  billing_plan_change_unsupported:
    "That plan change is not available through this action.",
  auth_unconfigured: "Auth is not configured yet.",
  auth_credentials_required: "Email and password are required.",
  auth_sign_in_failed: "Unable to sign in with those credentials.",
  auth_sign_up_failed: "Unable to create account right now.",
  auth_sign_up_confirmation_sent:
    "Account created. Check your email if confirmation is enabled."
}

export function getFormErrorMessage(
  code: string | null | undefined,
  t?: Translator["t"]
): string | null {
  if (!code) {
    return null
  }

  const trimmed = code.trim()
  if (!trimmed) {
    return null
  }

  if (FORM_ERROR_MESSAGES[trimmed]) {
    const translated = t ? t(trimmed as never) : null
    return translated && translated !== trimmed
      ? translated
      : FORM_ERROR_MESSAGES[trimmed]
  }

  try {
    const decoded = decodeURIComponent(trimmed)
    if (decoded !== trimmed && FORM_ERROR_MESSAGES[decoded]) {
      const translated = t ? t(decoded as never) : null
      return translated && translated !== decoded
        ? translated
        : FORM_ERROR_MESSAGES[decoded]
    }
  } catch {
    // ignore
  }

  return trimmed
}
