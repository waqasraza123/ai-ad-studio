import { NextResponse } from "next/server"
import { hasR2StorageConfiguration } from "@/lib/env"
import { getPublicDeliveryWorkspaceExportBundle } from "@/server/delivery-workspaces/public-delivery-workspace"
import { recordPublicDeliveryWorkspaceEventByToken } from "@/server/delivery-workspaces/delivery-workspace-repository"
import {
  buildAssetDownloadFileName,
  createInlineAssetResponse
} from "@/server/storage/r2-asset-download"

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      token: string
      exportId: string
    }>
  }
) {
  if (!hasR2StorageConfiguration()) {
    return NextResponse.json(
      {
        error: "R2 storage is not configured"
      },
      {
        status: 500
      }
    )
  }

  const { exportId, token } = await context.params
  const bundle = await getPublicDeliveryWorkspaceExportBundle({
    exportId,
    token
  })

  if (!bundle || !bundle.asset) {
    return NextResponse.json(
      {
        error: "Delivery export not found"
      },
      {
        status: 404
      }
    )
  }

  try {
    await recordPublicDeliveryWorkspaceEventByToken({
      eventType: "downloaded",
      exportId,
      token
    })
  } catch (error) {
    console.error(error)
  }

  return createInlineAssetResponse({
    asset: bundle.asset,
    fileName: buildAssetDownloadFileName(
      bundle.exportRecord.id,
      bundle.asset.mime_type
    )
  })
}
