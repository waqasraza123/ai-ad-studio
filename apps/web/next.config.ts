import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadEnvConfig } from "@next/env"
import type { NextConfig } from "next"

const appDir = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(appDir, "../..")

loadEnvConfig(workspaceRoot)

const nextConfig: NextConfig = {
  output: "standalone"
}

export default nextConfig
