export type E2EFixtureManifest = {
  owner: {
    email: string
    id: string
  }
  projectId: string
  exportId: string
  exportIds: string[]
  renderBatchId: string
  shareToken: string
  campaignToken: string
  reviewToken: string
  deliveryToken: string
  deliveryAcknowledgementToken: string
  deliveryExportId: string
}

export const seedProjectIds = {
  accountBrandKit: "e2e-brand-kit-main",
  canonicalExport: "e2e-export-canonical",
  campaign: "e2e-share-campaign-main",
  concept: "e2e-concept-main",
  deliveryAcknowledgementWorkspace: "e2e-delivery-workspace-ack",
  deliveryPrimaryWorkspace: "e2e-delivery-workspace-main",
  job: "e2e-job-render-main",
  notification: "e2e-notification-export-ready",
  notificationSecondary: "e2e-notification-delivery-reminder",
  previewAsset: "e2e-asset-preview-main",
  productAsset: "e2e-asset-product-main",
  project: "e2e-project-main",
  renderBatch: "e2e-render-batch-main",
  reviewComment: "e2e-batch-review-comment-main",
  reviewLink: "e2e-batch-review-link-main",
  secondaryExport: "e2e-export-secondary",
  secondaryExportAsset: "e2e-asset-export-secondary",
  shareLink: "e2e-share-link-main",
  showcaseItem: "e2e-showcase-item-main",
  subscription: "e2e-owner-subscription",
  usageEventConcept: "e2e-usage-event-concept",
  usageEventRender: "e2e-usage-event-render",
  videoLikeAsset: "e2e-asset-export-main"
} as const

export const seedTokens = {
  campaign: "e2ecampaigntokenmain0001",
  delivery: "e2edeliverytokenmain0001",
  deliveryAcknowledgement: "e2edeliveryacktoken0001",
  review: "e2ereviewtokenmain000001",
  share: "e2esharetokenmain000001"
} as const

export const tinyPreviewDataUrl =
  "data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
