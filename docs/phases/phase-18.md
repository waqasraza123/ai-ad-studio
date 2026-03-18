# Phase 18

Notifications and alerting for completed exports, failed jobs, and long-running queue states.

## Acceptance criteria

- durable notifications table exists
- export-ready notifications are created after successful render jobs
- failed job and retry notifications are created from worker failures
- cancelled job notifications are created from queue controls
- long-running queued and stalled running jobs generate warning notifications
- dashboard notifications center supports unread state and mark-as-read actions
