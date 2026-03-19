# Phase 28

Reviewer roles and external client review links with approve, reject, and comment flows per batch.

## Acceptance criteria

- durable batch_review_links and batch_review_comments tables exist
- owner can create and revoke external review links per batch
- public review page exists at review token routes
- external reviewers can approve or reject a batch
- external reviewers can comment on the batch or a specific output
- owner batch page shows external review links and review activity
- external review events write notifications and job traces
