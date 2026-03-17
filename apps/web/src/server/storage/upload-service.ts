import { PutObjectCommand } from "@aws-sdk/client-s3"
import { randomUUID } from "node:crypto"
import { hasR2StorageConfiguration, getServerEnvironment } from "@/lib/env"
import { createR2Client } from "./r2-client"

type UploadProjectAssetInput = {
  file: File
  ownerId: string
  projectId: string
}

export async function uploadProjectAssetToR2(input: UploadProjectAssetInput) {
  if (!hasR2StorageConfiguration()) {
    throw new Error("R2 storage is not configured")
  }

  const environment = getServerEnvironment()
  const client = createR2Client()
  const sanitizedFileName = input.file.name.replaceAll(/\s+/g, "-").toLowerCase()
  const storageKey = `projects/${input.projectId}/uploads/${randomUUID()}-${sanitizedFileName}`

  await client.send(
    new PutObjectCommand({
      Body: Buffer.from(await input.file.arrayBuffer()),
      Bucket: environment.R2_BUCKET_NAME,
      ContentType: input.file.type || "application/octet-stream",
      Key: storageKey
    })
  )

  return {
    storageKey
  }
}
