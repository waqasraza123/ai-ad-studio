# Phase 5

Concept generation pipeline with durable jobs and mock provider.

## Acceptance criteria

- project detail can enqueue a generate_concepts job
- worker claims queued jobs and processes generate_concepts
- mock provider returns exactly three concept drafts
- concepts are persisted for the project owner
- project status moves to generating_concepts and then concepts_ready
- project detail shows generation state and real concept cards
