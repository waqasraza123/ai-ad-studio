import OpenAI from "openai"
import { zodTextFormat } from "openai/helpers/zod"
import { getWorkerEnvironment } from "@/lib/env"
import {
  conceptGenerationResponseSchema,
  type ConceptGenerationResponse
} from "./schemas/concept-generation-schema"

type OpenAiConceptProviderInput = {
  brandTone: string | null
  callToAction: string | null
  offerText: string | null
  productDescription: string | null
  productName: string | null
  targetAudience: string | null
  visualStyle: string | null
}

function safeText(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : fallback
}

function buildPrompt(input: OpenAiConceptProviderInput) {
  const productName = safeText(input.productName, "the product")
  const productDescription = safeText(
    input.productDescription,
    "A premium product built for modern buyers."
  )
  const offerText = safeText(input.offerText, "Limited-time offer")
  const callToAction = safeText(input.callToAction, "Shop now")
  const targetAudience = safeText(input.targetAudience, "high-intent buyers")
  const brandTone = safeText(input.brandTone, "premium and clean")
  const visualStyle = safeText(
    input.visualStyle,
    "minimal studio visuals with luxury lighting"
  )

  return `
You are generating ad concepts for a constrained ecommerce ad system.

Return exactly 3 concepts in this exact order:
1. Direct response
2. Premium brand
3. Curiosity

Context:
- product_name: ${productName}
- product_description: ${productDescription}
- offer_text: ${offerText}
- call_to_action: ${callToAction}
- target_audience: ${targetAudience}
- brand_tone: ${brandTone}
- visual_style: ${visualStyle}

Rules:
- Keep each concept distinct and commercially useful
- Hooks must be concise and ad-ready
- Scripts must fit a 10-second vertical ad
- Visual directions must help image generation later
- No fake testimonials
- No unverifiable claims
- No medical or legal claims
- Stay grounded in the provided product description
`.trim()
}

export class OpenAiConceptProvider {
  private readonly client: OpenAI
  private readonly model: string

  constructor() {
    const environment = getWorkerEnvironment()

    this.client = new OpenAI({
      apiKey: environment.OPENAI_API_KEY
    })
    this.model = environment.OPENAI_CONCEPT_MODEL
  }

  async generateConcepts(
    input: OpenAiConceptProviderInput
  ): Promise<ConceptGenerationResponse> {
    const response = await this.client.responses.parse({
      model: this.model,
      input: [
        {
          role: "system",
          content:
            "Generate structured product ad concepts that strictly match the provided schema."
        },
        {
          role: "user",
          content: buildPrompt(input)
        }
      ],
      text: {
        format: zodTextFormat(conceptGenerationResponseSchema, "concept_generation")
      }
    })

    if (!response.output_parsed) {
      throw new Error("OpenAI did not return a structured concept payload")
    }

    return response.output_parsed
  }
}
