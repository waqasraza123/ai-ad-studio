# Phase 7

Real storage-backed uploads and final render pipeline scaffold.

## Acceptance criteria

- project asset uploads store real objects in R2 and persist uploaded asset rows
- project detail can enqueue a render_final_ad job
- worker processes render_final_ad and persists a scaffolded export artifact
- export row is created and project status becomes export_ready
- export detail page shows the scaffolded export summary
