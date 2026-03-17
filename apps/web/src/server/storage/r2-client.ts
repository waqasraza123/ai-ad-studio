import { S3Client } from "@aws-sdk/client-s3"
import { getServerEnvironment } from "@/lib/env"

export function createR2Client() {
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
