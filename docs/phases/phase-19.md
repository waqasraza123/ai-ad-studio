# Phase 19

Owner cost guardrails and job blocking.

## Acceptance criteria

- durable `owner_guardrails` records exist
- monthly budget caps can be configured per owner
- provider-specific budget caps can be configured per owner
- owner-scoped concurrency thresholds can be configured
- expensive jobs can be blocked before execution when guardrails would be exceeded
- owner settings UI exposes guardrail configuration clearly
- blocked jobs write enough state to explain why execution did not proceed
