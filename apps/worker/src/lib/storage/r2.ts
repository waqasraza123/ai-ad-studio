import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { readFile } from "node:fs/promises"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { getWorkerEnvironment } from "@/lib/env"

function createR2Client() {
  const environment = getWorkerEnvironment()

  return new S3Client({
    credentials: {
      accessKeyId: environment.R2_ACCESS_KEY_ID,
      secretAccessKey: environment.R2_SECRET_ACCESS_KEY
    },
    endpoint: `https://${environment.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: "auto"
  })
}

export async function uploadTextArtifactToR2(input: {
  body: string
  contentType: string
  storageKey: string
}) {
  const environment = getWorkerEnvironment()
  const client = createR2Client()

  await client.send(
    new PutObjectCommand({
      Body: Buffer.from(input.body),
      Bucket: environment.R2_BUCKET_NAME,
      ContentType: input.contentType,
      Key: input.storageKey
    })
  )

  return {
    storageKey: input.storageKey
  }
}

export async function uploadFileArtifactToR2(input: {
  contentType: string
  filePath: string
  storageKey: string
}) {
  const environment = getWorkerEnvironment()
  const client = createR2Client()
  const fileBuffer = await readFile(input.filePath)

  await client.send(
    new PutObjectCommand({
      Body: fileBuffer,
      Bucket: environment.R2_BUCKET_NAME,
      ContentType: input.contentType,
      Key: input.storageKey
    })
  )

  return {
    storageKey: input.storageKey
  }
}

export async function createSignedDownloadUrl(storageKey: string) {
  const environment = getWorkerEnvironment()
  const client = createR2Client()

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: environment.R2_BUCKET_NAME,
      Key: storageKey
    }),
    {
      expiresIn: 3600
    }
  )
}
