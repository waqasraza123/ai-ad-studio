import { z } from "zod"

export const DISALLOWED_WORDING_VALIDATION_ERROR = "disallowed_wording"
export const MODEST_WORDING_FORM_ERROR_CODE = "content_not_allowed"
export const MODEST_WORDING_ERROR_MESSAGE =
  "Use modest, professional wording and remove disallowed language before continuing."

export type DisallowedWordingValidationError =
  typeof DISALLOWED_WORDING_VALIDATION_ERROR

const DISALLOWED_TERMS = [
  "anal",
  "bastard",
  "bitch",
  "blowjob",
  "boobs",
  "breasts",
  "cock",
  "cum",
  "cunt",
  "dick",
  "escort",
  "faggot",
  "fetish",
  "fuck",
  "fucking",
  "handjob",
  "hookup",
  "horny",
  "motherfucker",
  "naked",
  "nigger",
  "nude",
  "orgasm",
  "penis",
  "porn",
  "porno",
  "pussy",
  "rape",
  "rapist",
  "seduce",
  "sex",
  "sexual",
  "sexy",
  "shit",
  "slut",
  "vagina",
  "whore",
  "xxx"
] as const

const SIMPLE_SEPARATOR_PATTERN = String.raw`[\s._-]*`

function normalizeForTokenScan(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function normalizeForCompactScan(value: string) {
  return value.toLowerCase().replace(/[\s._-]+/g, "")
}

function escapeRegexCharacter(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function buildFlexibleBoundaryPattern(term: string) {
  const compactTerm = normalizeForCompactScan(term).replace(/[^a-z0-9]/g, "")

  if (!compactTerm) {
    throw new Error("Disallowed wording term produced an empty pattern")
  }

  const joined = compactTerm
    .split("")
    .map((character) => escapeRegexCharacter(character))
    .join(SIMPLE_SEPARATOR_PATTERN)

  return new RegExp(`(^|[^a-z0-9])${joined}($|[^a-z0-9])`, "i")
}

const DISALLOWED_PATTERNS = DISALLOWED_TERMS.map((term) => ({
  compactTerm: normalizeForCompactScan(term).replace(/[^a-z0-9]/g, ""),
  pattern: buildFlexibleBoundaryPattern(term)
}))

export function containsDisallowedWording(value: string) {
  const tokenText = normalizeForTokenScan(value)
  const compactText = normalizeForCompactScan(value)

  if (!tokenText || !compactText) {
    return false
  }

  return DISALLOWED_PATTERNS.some(({ compactTerm, pattern }) => {
    if (pattern.test(tokenText)) {
      return true
    }

    return compactText === compactTerm
  })
}

export function validateModestText(
  value: string | null | undefined
): DisallowedWordingValidationError | null {
  if (!value) {
    return null
  }

  return containsDisallowedWording(value)
    ? DISALLOWED_WORDING_VALIDATION_ERROR
    : null
}

export function validateRecordTextFields(
  record: Record<string, string | null | undefined>
): DisallowedWordingValidationError | null {
  for (const value of Object.values(record)) {
    if (validateModestText(value)) {
      return DISALLOWED_WORDING_VALIDATION_ERROR
    }
  }

  return null
}

export function modestZodString<T extends z.ZodString>(schema: T) {
  return schema.refine(
    (value) => !containsDisallowedWording(value),
    DISALLOWED_WORDING_VALIDATION_ERROR
  )
}

export function hasDisallowedWordingIssue(error: z.ZodError<unknown>) {
  return error.issues.some(
    (issue) => issue.message === DISALLOWED_WORDING_VALIDATION_ERROR
  )
}
