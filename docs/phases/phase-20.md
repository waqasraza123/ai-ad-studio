# Phase 20

Human approval gates for sensitive renders, with approve/reject workflow before expensive final execution.

## Acceptance criteria

- durable approvals table exists
- final render jobs create approval requests before expensive execution starts
- project page shows an approval panel with approve and reject controls
- rejected approvals block the job from running
- approved approvals allow the render job to proceed after approval without requiring manual database changes
- notifications and traces are created for approval-required, approved, and rejected states
