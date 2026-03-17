import { writeFile } from "node:fs/promises"
import { getWorkerEnvironment } from "@/lib/env"

type OpenAiTtsProviderInput = {
  outputFilePath: string
  script: string
}

export class OpenAiTtsProvider {
  private readonly apiKey: string
  private readonly model: string
  private readonly voice: string

  constructor() {
    const environment = getWorkerEnvironment()

    this.apiKey = environment.OPENAI_API_KEY
    this.model = environment.OPENAI_TTS_MODEL
    this.voice = environment.OPENAI_TTS_VOICE
  }

  async generateVoiceover(input: OpenAiTtsProviderInput) {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        input: input.script,
        response_format: "mp3",
        voice: this.voice
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI TTS failed with status ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    await writeFile(input.outputFilePath, Buffer.from(arrayBuffer))

    return {
      model: this.model,
      outputFilePath: input.outputFilePath,
      voice: this.voice
    }
  }
}
