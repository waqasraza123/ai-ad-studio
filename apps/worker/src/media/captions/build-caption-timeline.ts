export type CaptionCue = {
  endSeconds: number
  startSeconds: number
  text: string
}

function normalizeScript(script: string) {
  return script
    .replace(/\s+/g, " ")
    .trim()
}

function splitIntoPhrases(script: string) {
  const bySentence = normalizeScript(script)
    .split(/[.!?]+/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0)

  if (bySentence.length >= 3) {
    return bySentence.slice(0, 3)
  }

  const words = normalizeScript(script).split(" ").filter(Boolean)
  const chunkSize = Math.max(4, Math.ceil(words.length / 3))
  const chunks: string[] = []

  for (let index = 0; index < words.length; index += chunkSize) {
    const chunk = words.slice(index, index + chunkSize).join(" ").trim()

    if (chunk.length > 0) {
      chunks.push(chunk)
    }
  }

  return chunks.slice(0, 3)
}

export function buildCaptionTimeline(input: {
  script: string
  totalDurationSeconds: number
}) {
  const phrases = splitIntoPhrases(input.script)

  if (phrases.length === 0) {
    return [] satisfies CaptionCue[]
  }

  const usableDuration = Math.max(1, input.totalDurationSeconds - 1.5)
  const segmentDuration = usableDuration / phrases.length

  return phrases.map((phrase, index) => {
    const startSeconds = Number((index * segmentDuration).toFixed(2))
    const endSeconds = Number(((index + 1) * segmentDuration).toFixed(2))

    return {
      endSeconds,
      startSeconds,
      text: phrase.length > 72 ? `${phrase.slice(0, 69)}...` : phrase
    }
  })
}
