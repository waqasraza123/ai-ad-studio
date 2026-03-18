import { spawn } from "node:child_process"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import type { CaptionCue } from "@/media/captions/build-caption-timeline"

type RenderMultiSceneAdInput = {
  aspectRatio: "9:16" | "1:1" | "16:9"
  audioFilePath: string
  ctaHeadlinePrefix: string
  ctaSubheadlineText: string
  ctaText: string
  emphasisStyle: "clean" | "bold" | "minimal"
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

function getCanvasSize(aspectRatio: "9:16" | "1:1" | "16:9") {
  if (aspectRatio === "1:1") {
    return {
      height: 1080,
      width: 1080
    }
  }

  if (aspectRatio === "16:9") {
    return {
      height: 1080,
      width: 1920
    }
  }

  return {
    height: 1920,
    width: 1080
  }
}

function getCaptionBox(aspectRatio: "9:16" | "1:1" | "16:9") {
  if (aspectRatio === "16:9") {
    return {
      boxHeight: 170,
      boxWidth: 1520,
      fontSize: 40,
      x: 200,
      y: 780
    }
  }

  if (aspectRatio === "1:1") {
    return {
      boxHeight: 170,
      boxWidth: 860,
      fontSize: 40,
      x: 110,
      y: 760
    }
  }

  return {
    boxHeight: 230,
    boxWidth: 940,
    fontSize: 46,
    x: 70,
    y: 1460
  }
}

function getHeadlineFontSize(emphasisStyle: "clean" | "bold" | "minimal") {
  if (emphasisStyle === "bold") {
    return 108
  }

  if (emphasisStyle === "minimal") {
    return 78
  }

  return 94
}

async function createCtaCardSvg(input: {
  aspectRatio: "9:16" | "1:1" | "16:9"
  ctaHeadlinePrefix: string
  ctaSubheadlineText: string
  ctaText: string
  emphasisStyle: "clean" | "bold" | "minimal"
  filePath: string
  projectName: string
}) {
  const { height, width } = getCanvasSize(input.aspectRatio)
  const projectY = input.aspectRatio === "16:9" ? 360 : input.aspectRatio === "1:1" ? 360 : 760
  const ctaY = input.aspectRatio === "16:9" ? 530 : input.aspectRatio === "1:1" ? 530 : 920
  const subY = input.aspectRatio === "16:9" ? 610 : input.aspectRatio === "1:1" ? 610 : 1000
  const headlineFontSize = getHeadlineFontSize(input.emphasisStyle)
  const headlineText = `${input.ctaHeadlinePrefix} ${input.ctaText}`.trim()

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
      <defs>
        <linearGradient id="bg" x1="120" y1="80" x2="${width - 140}" y2="${height - 80}" gradientUnits="userSpaceOnUse">
          <stop stop-color="#111827"/>
          <stop offset="0.55" stop-color="#312E81"/>
          <stop offset="1" stop-color="#020617"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <rect x="72" y="72" width="${width - 144}" height="${height - 144}" rx="40" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
      <text x="120" y="${projectY}" fill="#A5B4FC" font-size="30" font-family="Arial, sans-serif" letter-spacing="5">${escapeXml(input.projectName.toUpperCase())}</text>
      <text x="120" y="${ctaY}" fill="#FFFFFF" font-size="${headlineFontSize}" font-weight="700" font-family="Arial, sans-serif">${escapeXml(headlineText)}</text>
      <text x="120" y="${subY}" fill="#CBD5E1" font-size="36" font-family="Arial, sans-serif">${escapeXml(input.ctaSubheadlineText)}</text>
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

function buildSceneNormalizeFilters(
  aspectRatio: "9:16" | "1:1" | "16:9",
  sceneCount: number
) {
  const { height, width } = getCanvasSize(aspectRatio)

  return Array.from({ length: sceneCount }, (_, index) => {
    return `[${index}:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1[v${index}]`
  })
}

function buildConcatFilter(sceneCount: number) {
  const inputs = Array.from({ length: sceneCount }, (_, index) => `[v${index}][${index}:a]`).join("")
  const ctaIndex = sceneCount
  return `${inputs}[v${ctaIndex}][${ctaIndex}:a]concat=n=${sceneCount + 1}:v=1:a=1[basev][basea]`
}

function buildCaptionFilters(
  aspectRatio: "9:16" | "1:1" | "16:9",
  captionTimeline: CaptionCue[]
) {
  if (captionTimeline.length === 0) {
    return ["[basev]copy[vout]"]
  }

  const box = getCaptionBox(aspectRatio)
  const filters: string[] = []
  let currentLabel = "basev"

  captionTimeline.forEach((cue, index) => {
    const nextLabel = index === captionTimeline.length - 1 ? "vout" : `cap${index + 1}`
    const escapedText = escapeDrawText(cue.text)

    filters.push(
      `[${currentLabel}]drawbox=x=${box.x}:y=${box.y}:w=${box.boxWidth}:h=${box.boxHeight}:color=black@0.32:t=fill:enable='between(t,${cue.startSeconds},${cue.endSeconds})'[box${index}]`
    )
    filters.push(
      `[box${index}]drawtext=text='${escapedText}':fontcolor=white:fontsize=${box.fontSize}:x=(w-text_w)/2:y=${box.y + 85}:enable='between(t,${cue.startSeconds},${cue.endSeconds})'[${nextLabel}]`
    )

    currentLabel = nextLabel
  })

  return filters
}

export async function renderMultiSceneAd(input: RenderMultiSceneAdInput) {
  const { height, width } = getCanvasSize(input.aspectRatio)
  const ctaSvgPath = join(input.workspacePath, `cta-card-${input.aspectRatio.replace(":", "x")}.svg`)
  const ctaVideoPath = join(input.workspacePath, `cta-card-${input.aspectRatio.replace(":", "x")}.mp4`)

  await createCtaCardSvg({
    aspectRatio: input.aspectRatio,
    ctaHeadlinePrefix: input.ctaHeadlinePrefix,
    ctaSubheadlineText: input.ctaSubheadlineText,
    ctaText: input.ctaText,
    emphasisStyle: input.emphasisStyle,
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
    `scale=${width}:${height},format=yuv420p`,
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
  const sceneNormalizeFilters = buildSceneNormalizeFilters(
    input.aspectRatio,
    input.sceneVideoFilePaths.length
  )
  const ctaIndex = input.sceneVideoFilePaths.length

  const filterComplex = [
    ...sceneNormalizeFilters,
    `[${ctaIndex}:v]scale=${width}:${height},setsar=1[v${ctaIndex}]`,
    buildConcatFilter(input.sceneVideoFilePaths.length),
    ...buildCaptionFilters(input.aspectRatio, input.captionTimeline)
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
