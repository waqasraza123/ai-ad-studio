import { spawn } from "node:child_process"

function runCommand(command: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"]
    })

    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString()
    })

    child.on("error", reject)

    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout)
        return
      }

      reject(new Error(stderr || `Command failed with exit code ${code}`))
    })
  })
}

export async function getMediaDurationSeconds(filePath: string) {
  const output = await runCommand("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath
  ])

  const value = Number(output.trim())

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Unable to determine media duration")
  }

  return value
}
