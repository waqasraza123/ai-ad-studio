import {
  getWebRuntimeReadiness,
  getWebRuntimeStatus
} from "@/lib/env"

export async function GET() {
  const readiness = getWebRuntimeReadiness()

  return Response.json({
    name: "AI Ad Studio",
    readiness,
    service: "web",
    status: getWebRuntimeStatus(readiness),
    timestamp: new Date().toISOString()
  })
}
