import "server-only"

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(moduleDir, "../../../..")
const appRoot = path.resolve(workspaceRoot, "apps/web")

function stripWrappingQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}

function readEnvValueFromFile(filePath: string, key: string) {
  if (!fs.existsSync(filePath)) {
    return null
  }

  const content = fs.readFileSync(filePath, "utf8")
  const line = content
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${key}=`))

  if (!line) {
    return null
  }

  return stripWrappingQuotes(line.slice(key.length + 1).trim())
}

function resolveEnvValue(key: string) {
  const runtimeValue = process.env[key]?.trim()

  if (runtimeValue) {
    return runtimeValue
  }

  const candidates = [
    path.resolve(appRoot, ".env.local"),
    path.resolve(appRoot, ".env"),
    path.resolve(workspaceRoot, ".env.local"),
    path.resolve(workspaceRoot, ".env")
  ]

  for (const candidate of candidates) {
    const value = readEnvValueFromFile(candidate, key)

    if (value) {
      return value
    }
  }

  return ""
}

export function getHomeDemoSignIn() {
  return {
    email: "admin@gmail.com",
    password: resolveEnvValue("NEXT_PUBLIC_HOME_DEMO_SIGNIN_PASSWORD"),
    subtext: resolveEnvValue("NEXT_PUBLIC_HOME_DEMO_SIGNIN_SUBTEXT") || undefined
  }
}
