import { MODEST_WORDING_ERROR_MESSAGE } from "@/lib/modest-wording"

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
}

export function getFormErrorMessage(code: string | null | undefined): string | null {
  if (!code) {
    return null
  }

  const trimmed = code.trim()
  if (!trimmed) {
    return null
  }

  if (FORM_ERROR_MESSAGES[trimmed]) {
    return FORM_ERROR_MESSAGES[trimmed]
  }

  try {
    const decoded = decodeURIComponent(trimmed)
    if (decoded !== trimmed && FORM_ERROR_MESSAGES[decoded]) {
      return FORM_ERROR_MESSAGES[decoded]
    }
  } catch {
    // ignore
  }

  return trimmed
}
