# Phase 25

A/B variation batches per selected concept, with multiple controlled render variants generated in one approved run.

## Acceptance criteria

- durable render_batches table exists
- project page can create a variation batch from the selected concept
- one approved render job can fan out into multiple controlled variants
- batch run can generate exports across multiple aspect ratios and variant keys
- project page shows render batch history
- render metadata, usage events, and traces persist batch identifiers and variant keys
