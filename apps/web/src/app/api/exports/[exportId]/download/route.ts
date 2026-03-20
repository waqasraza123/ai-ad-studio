import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getExportByIdForOwner } from "@/server/exports/export-repository"
import { listAssetsByProjectIdForOwner } from "@/server/projects/asset-repository"
import {
  buildAssetDownloadFileName,
  createInlineAssetResponse
} from "@/server/storage/r2-asset-download"
import { hasR2StorageConfiguration } from "@/lib/env"

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
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

  const user = await getAuthenticatedUser()

  if (!user) {
    return NextResponse.json(
      {
        error: "Unauthorized"
      },
      {
        status: 401
      }
    )
  }

  const { exportId } = await context.params
  const exportRecord = await getExportByIdForOwner(exportId, user.id)

  if (!exportRecord) {
    return NextResponse.json(
      {
        error: "Export not found"
      },
      {
        status: 404
      }
    )
  }

  const assets = await listAssetsByProjectIdForOwner(
    exportRecord.project_id,
    user.id
  )
  const exportAsset =
    assets.find((asset) => asset.id === exportRecord.asset_id) ?? null

  if (!exportAsset) {
    return NextResponse.json(
      {
        error: "Export asset not found"
      },
      {
        status: 404
      }
    )
  }

  return createInlineAssetResponse({
    asset: exportAsset,
    fileName: buildAssetDownloadFileName(exportRecord.id, exportAsset.mime_type)
  })
}
