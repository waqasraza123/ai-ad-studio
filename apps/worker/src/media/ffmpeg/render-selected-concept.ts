import { spawn } from "node:child_process"

type RenderSelectedConceptVideoInput = {
  captionLines: string[]
  inputFilePath: string
  outputFilePath: string
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

function buildFilterGraph(captionLines: string[]) {
  const backgroundScale =
    "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p,zoompan=z='min(zoom+0.0007,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=300:s=1080x1920:fps=30[bg]"

  const captionFilters = captionLines
    .map((line, index) => {
      const escapedLine = escapeDrawText(line)
      const baseY = 1410 + index * 84

      return `[bg]drawbox=x=70:y=1330:w=940:h=340:color=black@0.28:t=fill[box${index}];[box${index}]drawtext=text='${escapedLine}':fontcolor=white:fontsize=44:x=(w-text_w)/2:y=${baseY}:box=0`
    })
    .join(";")

  return captionLines.length > 0
    ? `${backgroundScale};${captionFilters}`
    : backgroundScale
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

    child.on("error", (error) => {
      reject(error)
    })

    child.on("close", (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(stderr || `Command failed with exit code ${code}`))
    })
  })
}

export async function renderSelectedConceptVideo(
  input: RenderSelectedConceptVideoInput
) {
  const filterGraph = buildFilterGraph(input.captionLines)

  await runCommand("ffmpeg", [
    "-y",
    "-loop",
    "1",
    "-i",
    input.inputFilePath,
    "-f",
    "lavfi",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=48000",
    "-filter_complex",
    filterGraph,
    "-map",
    "0:v",
    "-map",
    "1:a",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "medium",
    "-r",
    "30",
    "-t",
    "10",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-shortest",
    input.outputFilePath
  ])
}
