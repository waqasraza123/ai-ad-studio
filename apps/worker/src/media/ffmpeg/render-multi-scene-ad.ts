import { spawn } from "node:child_process"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import type { CaptionCue } from "@/media/captions/build-caption-timeline"

type RenderMultiSceneAdInput = {
  audioFilePath: string
  ctaText: string
  sceneVideoFilePaths: string[]
  outputFilePath: string
  projectName: string
  workspacePath: string
  captionTimeline: CaptionCue[]
}

function escapeDrawText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(":", "\\:")
    .replaceAll("'", "\\'")
    .replaceAll("%", "\\%")
    .replaceAll(",", "\\,")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]")
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

async function createCtaCardSvg(input: {
  ctaText: string
  filePath: string
  projectName: string
}) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
      <defs>
        <linearGradient id="bg" x1="120" y1="80" x2="940" y2="1840" gradientUnits="userSpaceOnUse">
          <stop stop-color="#111827"/>
          <stop offset="0.55" stop-color="#312E81"/>
          <stop offset="1" stop-color="#020617"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#bg)"/>
      <rect x="72" y="72" width="936" height="1776" rx="40" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
      <text x="120" y="760" fill="#A5B4FC" font-size="30" font-family="Arial, sans-serif" letter-spacing="5">${escapeXml(input.projectName.toUpperCase())}</text>
      <text x="120" y="920" fill="#FFFFFF" font-size="94" font-weight="700" font-family="Arial, sans-serif">${escapeXml(input.ctaText)}</text>
      <text x="120" y="1000" fill="#CBD5E1" font-size="36" font-family="Arial, sans-serif">Built with AI Ad Studio</text>
    </svg>
  `.trim()

  await writeFile(input.filePath, svg, "utf8")
}

function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "pipe"
    })

    let stderr = ""

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString()
    })

    child.on("error", reject)

    child.on("close", (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(stderr || `Command failed with exit code ${code}`))
    })
  })
}

function buildConcatFilter(sceneCount: number) {
  const inputs = Array.from({ length: sceneCount }, (_, index) => `[${index}:v][${index}:a]`).join("")
  const ctaIndex = sceneCount
  return `${inputs}[${ctaIndex}:v][${ctaIndex}:a]concat=n=${sceneCount + 1}:v=1:a=1[basev][basea]`
}

function buildCaptionFilters(captionTimeline: CaptionCue[]) {
  if (captionTimeline.length === 0) {
    return ["[basev]copy[vout]"]
  }

  const filters: string[] = []
  let currentLabel = "basev"

  captionTimeline.forEach((cue, index) => {
    const nextLabel = index === captionTimeline.length - 1 ? "vout" : `cap${index + 1}`
    const escapedText = escapeDrawText(cue.text)

    filters.push(
      `[${currentLabel}]drawbox=x=70:y=1460:w=940:h=230:color=black@0.32:t=fill:enable='between(t,${cue.startSeconds},${cue.endSeconds})'[box${index}]`
    )
    filters.push(
      `[box${index}]drawtext=text='${escapedText}':fontcolor=white:fontsize=46:x=(w-text_w)/2:y=1545:enable='between(t,${cue.startSeconds},${cue.endSeconds})'[${nextLabel}]`
    )

    currentLabel = nextLabel
  })

  return filters
}

export async function renderMultiSceneAd(input: RenderMultiSceneAdInput) {
  const ctaSvgPath = join(input.workspacePath, "cta-card.svg")
  const ctaVideoPath = join(input.workspacePath, "cta-card.mp4")

  await createCtaCardSvg({
    ctaText: input.ctaText,
    filePath: ctaSvgPath,
    projectName: input.projectName
  })

  await runCommand("ffmpeg", [
    "-y",
    "-loop",
    "1",
    "-i",
    ctaSvgPath,
    "-f",
    "lavfi",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=48000",
    "-shortest",
    "-t",
    "1.5",
    "-vf",
    "scale=1080:1920,format=yuv420p",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "medium",
    "-r",
    "30",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    ctaVideoPath
  ])

  const sceneInputs = input.sceneVideoFilePaths.flatMap((filePath) => ["-i", filePath])
  const filterComplex = [
    buildConcatFilter(input.sceneVideoFilePaths.length),
    ...buildCaptionFilters(input.captionTimeline)
  ].join(";")

  await runCommand("ffmpeg", [
    "-y",
    ...sceneInputs,
    "-i",
    ctaVideoPath,
    "-i",
    input.audioFilePath,
    "-filter_complex",
    filterComplex,
    "-map",
    "[vout]",
    "-map",
    `${input.sceneVideoFilePaths.length + 1}:a`,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "medium",
    "-r",
    "30",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-t",
    "10",
    input.outputFilePath
  ])
}
