import { getAuthenticatedUser } from "@/server/auth/get-authenticated-user"
import { getActivationPackageByIdForOwner } from "@/server/activation/activation-repository"

type ActivationPackageManifestRouteProps = {
  params: Promise<{
    packageId: string
  }>
}

export async function GET(_: Request, { params }: ActivationPackageManifestRouteProps) {
  const user = await getAuthenticatedUser()

  if (!user) {
    return Response.json(
      {
        error: "Unauthorized"
      },
      {
        status: 401
      }
    )
  }

  const { packageId } = await params
  const activationPackage = await getActivationPackageByIdForOwner(packageId, user.id)

  if (!activationPackage) {
    return Response.json(
      {
        error: "Not found"
      },
      {
        status: 404
      }
    )
  }

  return new Response(JSON.stringify(activationPackage.manifest_json, null, 2), {
    headers: {
      "Content-Disposition": `attachment; filename="activation-package-${activationPackage.channel}-${activationPackage.id}.json"`,
      "Content-Type": "application/json; charset=utf-8"
    }
  })
}
