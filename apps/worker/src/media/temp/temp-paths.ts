import { mkdtemp, rm } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"

export async function createRenderWorkspace(prefix: string) {
  return mkdtemp(join(tmpdir(), `${prefix}-`))
}

export async function cleanupRenderWorkspace(directoryPath: string) {
  await rm(directoryPath, {
    force: true,
    recursive: true
  })
}
