import "server-only"
import type {
  AssetRecord,
  DeliveryWorkspaceExportRecord,
  DeliveryWorkspaceRecord,
  ExportRecord
} from "@/server/database/types"
import {
  getActiveDeliveryWorkspaceByToken,
  listAssetsForDeliveryWorkspace,
  listExportsForDeliveryWorkspace,
  listPublicDeliveryWorkspaceExportsByWorkspaceId
} from "@/server/delivery-workspaces/delivery-workspace-repository"

type PublicDeliveryWorkspaceExportBundle = {
  asset: AssetRecord | null
  exportRecord: ExportRecord
  workspace: DeliveryWorkspaceRecord
  workspaceExport: DeliveryWorkspaceExportRecord
}

export async function getPublicDeliveryWorkspaceExportBundle(input: {
  exportId: string
  token: string
}): Promise<PublicDeliveryWorkspaceExportBundle | null> {
  const workspace = await getActiveDeliveryWorkspaceByToken(input.token)

  if (!workspace) {
    return null
  }

  const workspaceExports = await listPublicDeliveryWorkspaceExportsByWorkspaceId(
    workspace.id
  )

  const workspaceExport =
    workspaceExports.find((item) => item.export_id === input.exportId) ?? null

  if (!workspaceExport) {
    return null
  }

  const exportRecords = await listExportsForDeliveryWorkspace({
    exportIds: [input.exportId]
  })

  const exportRecord = exportRecords[0] ?? null

  if (!exportRecord) {
    return null
  }

  const assets =
    exportRecord.asset_id != null
      ? await listAssetsForDeliveryWorkspace({
          assetIds: [exportRecord.asset_id]
        })
      : []

  const asset = assets[0] ?? null

  return {
    asset,
    exportRecord,
    workspace,
    workspaceExport
  }
}
