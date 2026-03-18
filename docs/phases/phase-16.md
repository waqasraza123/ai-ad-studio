# Phase 16

Admin/debug tooling for failed jobs, provider payload traces, and retry controls.

## Acceptance criteria

- durable job_traces table exists
- worker records lifecycle and provider trace payloads for async jobs
- debug jobs dashboard exists
- individual job detail page shows payload, result, error, and trace timeline
- failed jobs can be safely retried from the UI
- project page links naturally into the debug and recovery workflow
