# Phase 17

Queue controls, cancellation, concurrency limits, and safer backoff rules.

## Acceptance criteria

- jobs support cancellation requests and cancellation metadata
- failed jobs can be retried with exponential backoff scheduling
- worker only claims jobs that are due for execution
- worker enforces owner-scoped concurrency limits by job type
- debug UI supports cancel and retry controls
- job traces capture cancellation and retry lifecycle states
