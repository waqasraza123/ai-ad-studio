import OpenAI from "openai"
import { zodTextFormat } from "openai/helpers/zod"
import { getWorkerEnvironment } from "@/lib/env"
import {
  reviewedConceptSchema,
  type ReviewedConcept
} from "./schemas/claim-review-schema"

type ClaimReviewInput = {
  hook: string
  offerText: string | null
  productDescription: string | null
  script: string
}

function safeText(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : fallback
}

function buildPrompt(input: ClaimReviewInput) {
  return `
Review this ad copy for risky or unverifiable claims.

Context:
- product_description: ${safeText(input.productDescription, "No description provided")}
- offer_text: ${safeText(input.offerText, "No offer text provided")}
- hook: ${input.hook}
- script: ${input.script}

You must:
- soften unverifiable claims
- remove fake urgency if not grounded
- avoid medical, legal, and guaranteed-outcome language
- keep the result commercially useful and concise
- preserve the selling intent when possible
`.trim()
}

export class OpenAiClaimReviewProvider {
  private readonly client: OpenAI
  private readonly model: string

  constructor() {
    const environment = getWorkerEnvironment()

    this.client = new OpenAI({
      apiKey: environment.OPENAI_API_KEY
    })
    this.model = environment.OPENAI_CONCEPT_MODEL
  }

  async reviewConcept(input: ClaimReviewInput): Promise<ReviewedConcept> {
    const response = await this.client.responses.parse({
      model: this.model,
      input: [
        {
          role: "system",
          content:
            "Review ad copy for safety and return only the structured review payload."
        },
        {
          role: "user",
          content: buildPrompt(input)
        }
      ],
      text: {
        format: zodTextFormat(reviewedConceptSchema, "claim_review")
      }
    })

    if (!response.output_parsed) {
      throw new Error("OpenAI did not return a structured claim review payload")
    }

    return response.output_parsed
  }
}
