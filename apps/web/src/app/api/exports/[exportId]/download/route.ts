import { NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getExportByIdForOwner } from "@/server/exports/export-repository"
import { listAssetsByProjectIdForOwner } from "@/server/projects/asset-repository"
import { getServerEnvironment, hasR2StorageConfiguration } from "@/lib/env"

function createR2Client() {
  const environment = getServerEnvironment()

  if (
    !environment.R2_ACCOUNT_ID ||
    !environment.R2_ACCESS_KEY_ID ||
    !environment.R2_SECRET_ACCESS_KEY
  ) {
    throw new Error("R2 storage is not configured")
  }

  return new S3Client({
    credentials: {
      accessKeyId: environment.R2_ACCESS_KEY_ID,
      secretAccessKey: environment.R2_SECRET_ACCESS_KEY
    },
    endpoint: `https://${environment.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: "auto"
  })
}

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

  const assets = await listAssetsByProjectIdForOwner(exportRecord.project_id, user.id)
  const exportAsset = assets.find((asset) => asset.id === exportRecord.asset_id)

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

  const environment = getServerEnvironment()
  const client = createR2Client()
  const objectResponse = await client.send(
    new GetObjectCommand({
      Bucket: environment.R2_BUCKET_NAME,
      Key: exportAsset.storage_key
    })
  )

  if (!objectResponse.Body) {
    return NextResponse.json(
      {
        error: "Export body not found"
      },
      {
        status: 404
      }
    )
  }

  const byteArray = await objectResponse.Body.transformToByteArray()
  const body = byteArray.buffer.slice(
    byteArray.byteOffset,
    byteArray.byteOffset + byteArray.byteLength
  ) as ArrayBuffer

  return new Response(body, {
    headers: {
      "Content-Disposition": `inline; filename="${exportId}.mp4"`,
      "Content-Type": exportAsset.mime_type
    }
  })
}
