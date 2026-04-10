import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { getServerEnvironment } from "@/lib/env"
import {
  CreativePerformanceError,
  ingestManualCreativePerformance,
  parseManualCreativePerformanceInput
} from "@/server/creative-performance/creative-performance-service"

export async function POST(request: Request) {
  const environment = getServerEnvironment()
  const authHeader = request.headers.get("authorization")
  const expected = environment.CREATIVE_PERFORMANCE_OPERATOR_SECRET

  if (!expected) {
    return Response.json(
      {
        error: "CREATIVE_PERFORMANCE_OPERATOR_SECRET is not configured"
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

  let body: Record<string, unknown>

  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json(
      {
        error: "Invalid JSON"
      },
      {
        status: 400
      }
    )
  }

  try {
    const input = parseManualCreativePerformanceInput({
      activationPackageId: body.activationPackageId,
      channel: body.channel,
      clicks: body.clicks,
      conversionValueUsd: body.conversionValueUsd,
      conversions: body.conversions,
      exportId: body.exportId,
      externalAccountLabel: body.externalAccountLabel,
      impressions: body.impressions,
      metricDate: body.metricDate,
      notes: body.notes,
      operatorLabel:
        typeof body.operatorLabel === "string" ? body.operatorLabel : "operator_api",
      ownerId: String(body.ownerId ?? "").trim(),
      source: "manual_operator",
      spendUsd: body.spendUsd,
      submittedByUserId: null
    })

    const record = await ingestManualCreativePerformance({
      ...input,
      client: createSupabaseAdminClient()
    })

    return Response.json({
      id: record.id,
      status: "ok"
    })
  } catch (error) {
    if (error instanceof CreativePerformanceError) {
      return Response.json(
        {
          error: error.code
        },
        {
          status: 400
        }
      )
    }

    return Response.json(
      {
        error: "creative_performance_invalid"
      },
      {
        status: 500
      }
    )
  }
}
