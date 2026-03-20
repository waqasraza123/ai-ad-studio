import "server-only"
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getServerEnvironment } from "@/lib/env"
import type { AssetRecord } from "@/server/database/types"

type DownloadableAsset = Pick<AssetRecord, "mime_type" | "storage_key">

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

function getFileExtension(mimeType: string) {
  if (mimeType === "video/mp4") {
    return "mp4"
  }

  const [, subtype] = mimeType.split("/")
  const normalizedSubtype = subtype?.split(";")[0]?.trim()

  return normalizedSubtype || "bin"
}

export function buildAssetDownloadFileName(assetId: string, mimeType: string) {
  return `${assetId}.${getFileExtension(mimeType)}`
}

export async function createInlineAssetResponse(input: {
  asset: DownloadableAsset
  fileName: string
}) {
  const environment = getServerEnvironment()

  if (!environment.R2_BUCKET_NAME) {
    throw new Error("R2 storage is not configured")
  }

  const client = createR2Client()
  const objectResponse = await client.send(
    new GetObjectCommand({
      Bucket: environment.R2_BUCKET_NAME,
      Key: input.asset.storage_key
    })
  )

  if (!objectResponse.Body) {
    throw new Error("Export body not found")
  }

  const bytes = await objectResponse.Body.transformToByteArray()

  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Disposition": `inline; filename="${input.fileName}"`,
      "Content-Type": input.asset.mime_type
    }
  })
}
