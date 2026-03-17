# Phase 6

Concept preview generation and concept selection.

## Acceptance criteria

- project detail can enqueue a generate_concept_preview job
- worker claims queued preview jobs and persists one preview asset per concept
- concept cards render preview visuals from persisted asset metadata
- one concept can be selected and persisted on the project
- selected concept state remains visible after refresh
