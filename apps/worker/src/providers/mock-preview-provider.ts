import type {
  PreviewGenerationProvider,
  PreviewGenerationProviderInput,
  PreviewGenerationProviderResult
} from "@/providers/media-provider-types"

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function createDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export class MockPreviewProvider implements PreviewGenerationProvider {
  async generatePreview(
    input: PreviewGenerationProviderInput
  ): Promise<PreviewGenerationProviderResult> {
    const title = escapeXml(input.title.slice(0, 28))
    const angle = escapeXml(input.angle.slice(0, 24))
    const hook = escapeXml(input.hook.slice(0, 120))

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" fill="none">
        <defs>
          <linearGradient id="bg" x1="120" y1="40" x2="720" y2="940" gradientUnits="userSpaceOnUse">
            <stop stop-color="#0F172A"/>
            <stop offset="0.45" stop-color="#312E81"/>
            <stop offset="1" stop-color="#020617"/>
          </linearGradient>
          <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(260 140) rotate(66.8) scale(460 460)">
            <stop stop-color="#818CF8" stop-opacity="0.95"/>
            <stop offset="1" stop-color="#818CF8" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="800" height="1000" rx="44" fill="url(#bg)"/>
        <rect width="800" height="1000" rx="44" fill="url(#glow)"/>
        <rect x="48" y="48" width="704" height="904" rx="34" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)"/>
        <rect x="92" y="112" width="616" height="420" rx="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)"/>
        <circle cx="400" cy="324" r="106" fill="rgba(255,255,255,0.08)"/>
        <rect x="260" y="222" width="280" height="204" rx="30" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.16)"/>
        <text x="96" y="610" fill="#A5B4FC" font-size="22" font-family="Arial, sans-serif" letter-spacing="3.5">${angle.toUpperCase()}</text>
        <text x="96" y="682" fill="#F8FAFC" font-size="48" font-weight="700" font-family="Arial, sans-serif">${title}</text>
        <foreignObject x="96" y="720" width="608" height="150">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: #CBD5E1; font-size: 28px; line-height: 1.45;">
            ${hook}
          </div>
        </foreignObject>
      </svg>
    `.trim()

    return {
      model: "mock-svg",
      previewDataUrl: createDataUrl(svg),
      provider: "mock"
    }
  }
}
