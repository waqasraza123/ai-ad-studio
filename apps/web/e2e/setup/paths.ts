import path from "node:path"
import { fileURLToPath } from "node:url"

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))

export const webAppRoot = path.resolve(currentDirectory, "..", "..")
export const e2eGeneratedDirectory = path.join(webAppRoot, "e2e", ".generated")
export const e2eFixtureManifestPath = path.join(
  e2eGeneratedDirectory,
  "fixture-manifest.json"
)
export const e2eDashboardStorageStatePath = path.join(
  e2eGeneratedDirectory,
  "dashboard-auth.json"
)
export const e2ePort = 3100

export function resolveE2EBaseUrl() {
  return process.env.E2E_BASE_URL ?? `http://127.0.0.1:${e2ePort}`
}
