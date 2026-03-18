import { NextResponse } from "next/server"
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getServerEnvironment } from "@/lib/env"
import { getSharedExportBundleByToken } from "@/server/exports/share-link-repository"

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
      token: string
    }>
  }
) {
  const { token } = await context.params
  const bundle = await getSharedExportBundleByToken(token)

  if (!bundle || !bundle.asset) {
    return NextResponse.json(
      {
        error: "Shared export not found"
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
      Key: bundle.asset.storage_key
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

  const bytes = await objectResponse.Body.transformToByteArray()

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Disposition": `inline; filename="${bundle.exportRecord.id}.mp4"`,
      "Content-Type": bundle.asset.mime_type
    }
  })
}
