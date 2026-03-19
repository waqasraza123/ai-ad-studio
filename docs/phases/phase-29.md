# Phase 29

Final decision workflow, where owner can lock a reviewed winner, freeze further public review, and convert it into the canonical promoted asset for campaigns and showcase.

## Acceptance criteria

- projects support canonical_export_id
- render_batches support finalization fields
- owner can finalize a reviewed batch winner from the batch page
- finalized batches lock winner selection
- finalized batches close active public review links
- public review pages become read-only after finalization
- only finalized canonical exports are eligible for public promotion
- non-canonical showcase items and share campaigns are deactivated automatically
- final decision events write notifications and job traces
