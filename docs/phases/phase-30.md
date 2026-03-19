# Phase 30

Client delivery workspace, where the finalized canonical export gets a polished delivery page with approval summary, downloadable assets, and owner-prepared handoff notes.

## Acceptance criteria

- durable delivery_workspaces and delivery_workspace_exports tables exist
- only finalized canonical exports can create delivery workspaces
- owner can prepare title, summary, handoff notes, and included downloadable exports
- public delivery page exists at delivery token routes
- public delivery page shows approval summary, handoff notes, and downloadable assets
- outdated delivery workspaces are archived automatically when canonical export changes
- delivery publish and archive events write notifications and job traces
