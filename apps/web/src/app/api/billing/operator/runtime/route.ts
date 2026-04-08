import { getServerEnvironment } from "@/lib/env"
import { getBillingRuntimeDiagnostics } from "@/server/billing/runtime-readiness"

export async function GET(request: Request) {
  const environment = getServerEnvironment()
  const authHeader = request.headers.get("authorization")
  const expected = environment.BILLING_OPERATOR_SECRET

  if (!expected) {
    return Response.json(
      {
        error: "BILLING_OPERATOR_SECRET is not configured"
      },
      {
        status: 503
      }
    )
  }

  if (authHeader !== `Bearer ${expected}`) {
    return Response.json(
      {
        error: "Unauthorized"
      },
      {
        status: 401
      }
    )
  }

  const diagnostics = await getBillingRuntimeDiagnostics()

  return Response.json(diagnostics, {
    headers: {
      "Cache-Control": "no-store"
    }
  })
}
