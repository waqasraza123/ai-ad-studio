type ConceptDraft = {
  angle: string
  captionStyle: string
  hook: string
  script: string
  title: string
  visualDirection: string
}

type MockConceptProviderInput = {
  brandTone: string | null
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

export class MockConceptProvider {
  generateConcepts(input: MockConceptProviderInput): ConceptDraft[] {
    const productName = safeText(input.productName, "Your product")
    const productDescription = safeText(
      input.productDescription,
      "A premium product designed for modern buyers."
    )
    const offerText = safeText(input.offerText, "Limited-time offer")
    const targetAudience = safeText(input.targetAudience, "high-intent buyers")
    const brandTone = safeText(input.brandTone, "premium and clean")
    const visualStyle = safeText(input.visualStyle, "minimal studio visuals")

    return [
      {
        angle: "Direct response",
        captionStyle: "Bold conversion copy",
        hook: `${offerText} for ${targetAudience} without the usual visual clutter.`,
        script: `${productName} puts the value proposition upfront. Open with the strongest product shot, call out ${offerText.toLowerCase()}, and close with a tight CTA for ${targetAudience}.`,
        title: `${productName} offer push`,
        visualDirection: `Fast-paced product framing with ${visualStyle} and clear CTA emphasis.`
      },
      {
        angle: "Premium brand",
        captionStyle: "Minimal luxury captions",
        hook: `${productName} presented with a ${brandTone} feel and premium pacing.`,
        script: `Position ${productName} as a refined choice. Use ${visualStyle}, let the product breathe on screen, and describe the product through a short premium voiceover built from: ${productDescription}`,
        title: `${productName} premium reveal`,
        visualDirection: `Elegant close-ups, soft gradients, clean surfaces, and restrained motion.`
      },
      {
        angle: "Curiosity",
        captionStyle: "Question-led captions",
        hook: `Why are ${targetAudience} paying attention to ${productName} right now?`,
        script: `Start with curiosity and contrast. Tease what makes ${productName} stand out, then ground the reveal in this message: ${productDescription}. Resolve with a crisp invitation tied to ${offerText.toLowerCase()}.`,
        title: `${productName} curiosity hook`,
        visualDirection: `Curiosity-led sequencing with surprising product crops and tension before the reveal.`
      }
    ]
  }
}
