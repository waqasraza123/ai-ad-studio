import { NextResponse } from "next/server"
import { hasR2StorageConfiguration } from "@/lib/env"
import { getPublicShareCampaignBundleByToken } from "@/server/share-campaigns/public-share-campaign"
import {
  buildAssetDownloadFileName,
  createInlineAssetResponse
} from "@/server/storage/r2-asset-download"

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      token: string
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

  const { token } = await context.params
  const bundle = await getPublicShareCampaignBundleByToken(token)

  if (!bundle || !bundle.asset) {
    return NextResponse.json(
      {
        error: "Campaign export not found"
      },
      {
        status: 404
      }
    )
  }

  return createInlineAssetResponse({
    asset: bundle.asset,
    fileName: buildAssetDownloadFileName(
      bundle.exportRecord.id,
      bundle.asset.mime_type
    )
  })
}
