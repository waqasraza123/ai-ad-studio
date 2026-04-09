import fs from "node:fs"
import { type E2EFixtureManifest } from "../setup/fixture-manifest"
import { e2eFixtureManifestPath } from "../setup/paths"

let cachedManifest: E2EFixtureManifest | null = null

export function readFixtureManifest() {
  if (cachedManifest) {
    return cachedManifest
  }

  const rawManifest = fs.readFileSync(e2eFixtureManifestPath, "utf8")
  cachedManifest = JSON.parse(rawManifest) as E2EFixtureManifest
  return cachedManifest
}
