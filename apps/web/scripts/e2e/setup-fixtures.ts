import { seedE2EFixtures } from "../../e2e/setup/seed-fixtures"
import { e2eFixtureManifestPath } from "../../e2e/setup/paths"

async function main() {
  const { manifest } = await seedE2EFixtures()

  console.log("Seeded Playwright fixtures")
  console.log(`Manifest: ${e2eFixtureManifestPath}`)
  console.log(`Owner: ${manifest.owner.email}`)
  console.log(`Project: ${manifest.projectId}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
