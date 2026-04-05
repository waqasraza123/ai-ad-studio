# Phase 2

App shells and package boundaries.

## Acceptance criteria

- `apps/web` exists and starts successfully
- `apps/worker` exists and starts successfully
- `packages/shared` exists for shared contracts and types
- `packages/config` exists for shared configuration
- `packages/ui` exists for shared UI primitives
- `packages/providers` exists for provider adapters
- `packages/media` exists for media composition helpers
- import boundaries are clear enough that web, worker, and shared code can evolve independently
