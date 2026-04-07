import { spawn } from "node:child_process"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import type { CaptionCue } from "@/media/captions/build-caption-timeline"

type RenderMultiSceneAdInput = {
  aspectRatio: "9:16" | "1:1" | "16:9"
  audioFilePath: string
  brandBackground: string
  brandForeground: string
  brandPrimary: string
  brandSecondary: string
  captionLayout: {
    box_width: number
    box_height: number
    x: number
    y: number
    font_size: number
  }
  ctaHeadlinePrefix: string
  ctaSubheadlineText: string
  ctaText: string
  ctaStartSeconds: number
  ctaCardSeconds: number
  emphasisStyle: "clean" | "bold" | "minimal"
  headingFontFamily: string
  safeZone: {
    top: number
    right: number
    bottom: number
    left: number
  }
  sceneVideoFilePaths: string[]
  outputFilePath: string
  projectName: string
  workspacePath: string
  captionTimeline: CaptionCue[]
  watermarkText?: string | null
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
  brandBackground: string
  brandForeground: string
  brandPrimary: string
  brandSecondary: string
  ctaHeadlinePrefix: string
  ctaSubheadlineText: string
  ctaText: string
  emphasisStyle: "clean" | "bold" | "minimal"
  filePath: string
  headingFontFamily: string
  projectName: string
  safeZone: {
    top: number
    right: number
    bottom: number
    left: number
  }
}) {
  const { width } = getCanvasSize(input.aspectRatio)
  const projectY =
    input.aspectRatio === "16:9"
      ? Math.max(180, 280 + input.safeZone.top)
      : input.aspectRatio === "1:1"
        ? Math.max(180, 280 + input.safeZone.top)
        : Math.max(320, 620 + input.safeZone.top / 2)
  const ctaY =
    input.aspectRatio === "16:9"
      ? Math.max(340, 450 + input.safeZone.top / 2)
      : input.aspectRatio === "1:1"
        ? Math.max(340, 450 + input.safeZone.top / 2)
        : Math.max(540, 780 + input.safeZone.top / 2)
  const subY =
    input.aspectRatio === "16:9"
      ? ctaY + 80
      : input.aspectRatio === "1:1"
        ? ctaY + 80
        : ctaY + 90
  const headlineFontSize = getHeadlineFontSize(input.emphasisStyle)
  const headlineText = `${input.ctaHeadlinePrefix} ${input.ctaText}`.trim()
  const leftPadding = 120 + input.safeZone.left / 2
  const { height } = getCanvasSize(input.aspectRatio)

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
      <defs>
        <linearGradient id="bg" x1="120" y1="80" x2="${width - 140}" y2="${height - 80}" gradientUnits="userSpaceOnUse">
          <stop stop-color="${escapeXml(input.brandBackground)}"/>
          <stop offset="0.55" stop-color="${escapeXml(input.brandPrimary)}"/>
          <stop offset="1" stop-color="${escapeXml(input.brandSecondary)}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <rect x="${72 + input.safeZone.left / 4}" y="${72 + input.safeZone.top / 4}" width="${width - 144 - input.safeZone.left / 4 - input.safeZone.right / 4}" height="${height - 144 - input.safeZone.top / 4 - input.safeZone.bottom / 4}" rx="40" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
      <text x="${leftPadding}" y="${projectY}" fill="${escapeXml(input.brandSecondary)}" font-size="30" font-family="${escapeXml(input.headingFontFamily)}, Arial, sans-serif" letter-spacing="5">${escapeXml(input.projectName.toUpperCase())}</text>
      <text x="${leftPadding}" y="${ctaY}" fill="${escapeXml(input.brandForeground)}" font-size="${headlineFontSize}" font-weight="700" font-family="${escapeXml(input.headingFontFamily)}, Arial, sans-serif">${escapeXml(headlineText)}</text>
      <text x="${leftPadding}" y="${subY}" fill="${escapeXml(input.brandForeground)}" font-size="36" font-family="${escapeXml(input.headingFontFamily)}, Arial, sans-serif">${escapeXml(input.ctaSubheadlineText)}</text>
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

function buildSceneConcatFilter(sceneCount: number) {
  const inputs = Array.from({ length: sceneCount }, (_, index) => `[v${index}]`).join("")
  return `${inputs}concat=n=${sceneCount}:v=1:a=0[scenev]`
}

function buildCaptionFilters(
  captionLayout: {
    box_width: number
    box_height: number
    x: number
    y: number
    font_size: number
  },
  captionTimeline: CaptionCue[]
) {
  if (captionTimeline.length === 0) {
    return ["[finalbasev]copy[vout]"]
  }

  const filters: string[] = []
  let currentLabel = "finalbasev"

  captionTimeline.forEach((cue, index) => {
    const nextLabel = index === captionTimeline.length - 1 ? "vout" : `cap${index + 1}`
    const escapedText = escapeDrawText(cue.text)

    filters.push(
      `[${currentLabel}]drawbox=x=${captionLayout.x}:y=${captionLayout.y}:w=${captionLayout.box_width}:h=${captionLayout.box_height}:color=black@0.32:t=fill:enable='between(t,${cue.startSeconds},${cue.endSeconds})'[box${index}]`
    )
    filters.push(
      `[box${index}]drawtext=text='${escapedText}':fontcolor=white:fontsize=${captionLayout.font_size}:x=(w-text_w)/2:y=${captionLayout.y + Math.floor(captionLayout.box_height / 2)}:enable='between(t,${cue.startSeconds},${cue.endSeconds})'[${nextLabel}]`
    )

    currentLabel = nextLabel
  })

  return filters
}

function buildWatermarkFilters(input: {
  watermarkText?: string | null
}) {
  if (!input.watermarkText) {
    return []
  }

  const escapedText = escapeDrawText(input.watermarkText)

  return [
    `[vout]drawtext=text='${escapedText}':fontcolor=white@0.34:fontsize=28:x=w-tw-48:y=h-th-48[vwatermarked]`
  ]
}

export async function renderMultiSceneAd(input: RenderMultiSceneAdInput) {
  const { height, width } = getCanvasSize(input.aspectRatio)
  const ctaSvgPath = join(input.workspacePath, `cta-card-${input.aspectRatio.replace(":", "x")}.svg`)
  const ctaVideoPath = join(input.workspacePath, `cta-card-${input.aspectRatio.replace(":", "x")}.mp4`)
  const totalDuration = input.ctaStartSeconds + input.ctaCardSeconds

  await createCtaCardSvg({
    aspectRatio: input.aspectRatio,
    brandBackground: input.brandBackground,
    brandForeground: input.brandForeground,
    brandPrimary: input.brandPrimary,
    brandSecondary: input.brandSecondary,
    ctaHeadlinePrefix: input.ctaHeadlinePrefix,
    ctaSubheadlineText: input.ctaSubheadlineText,
    ctaText: input.ctaText,
    emphasisStyle: input.emphasisStyle,
    filePath: ctaSvgPath,
    headingFontFamily: input.headingFontFamily,
    projectName: input.projectName,
    safeZone: input.safeZone
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
    String(input.ctaCardSeconds),
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
  const ctaVideoInputIndex = input.sceneVideoFilePaths.length
  const voiceoverAudioInputIndex = input.sceneVideoFilePaths.length + 1

  const filterComplex = [
    ...buildSceneNormalizeFilters(input.aspectRatio, input.sceneVideoFilePaths.length),
    buildSceneConcatFilter(input.sceneVideoFilePaths.length),
    `[scenev]trim=duration=${input.ctaStartSeconds},setpts=PTS-STARTPTS[trimv]`,
    `[${ctaVideoInputIndex}:v]scale=${width}:${height},setsar=1[ctav]`,
    `[trimv][ctav]concat=n=2:v=1:a=0[finalbasev]`,
    ...buildCaptionFilters(input.captionLayout, input.captionTimeline),
    ...buildWatermarkFilters({
      watermarkText: input.watermarkText
    })
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
    input.watermarkText ? "[vwatermarked]" : "[vout]",
    "-map",
    `${voiceoverAudioInputIndex}:a`,
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
    String(totalDuration),
    input.outputFilePath
  ])
}
