# Current Session

## Date

2026-04-08

## Current Objective

Add a production-grade repo-managed safe push workflow with a versioned pre-push hook, shared verifier, wrapper command, package scripts, docs, and local clone setup.

## Last Completed Step

Added `.githooks/pre-push`, `scripts/verify-push.sh`, and `scripts/safe-push.sh`; wired root `package.json` scripts for `pnpm hooks:setup`, `pnpm verify:push`, and `pnpm safe-push`; documented the flow in `CONTRIBUTING.md`; and applied the hook path in this clone with `git config --local core.hooksPath .githooks`.

## Current Step

Implementation and local verification are complete. The next practical step is deciding whether push verification should stay build-only or expand later to lint/typecheck/test in the same shared verifier.

## Scope Boundaries

- Billing is owner-scoped, not org/seat-scoped.
- Self-serve billing uses Stripe; manual stablecoin settlement is operator-only.
- `owner_guardrails` remain editable only as tighter personal caps beneath plan entitlements.
- Public campaign/delivery/showcase creation is gated by plan access; existing public items now use a 30-day downgrade-access check at read time.

## Likely Files To Touch Next

- `.githooks/pre-push`
- `scripts/verify-push.sh`
- `scripts/safe-push.sh`
- `package.json`
- `CONTRIBUTING.md`
- `docs/_local/current-session.md`

## Key Constraints

- Normal `git push` must be blocked by the versioned pre-push hook when `pnpm build` fails.
- `pnpm safe-push` must remain the explicit AI-friendly wrapper command.
- `pnpm safe-push` should not pay for duplicate hook verification after it already ran the shared verifier.
- Hook setup must stay clone-local through `git config --local core.hooksPath .githooks`.

## Verification Commands

- `bash -n .githooks/pre-push scripts/verify-push.sh scripts/safe-push.sh`
- `pnpm hooks:setup`
- `pnpm verify:push`
- `pnpm safe-push -- --dry-run <temporary-remote> HEAD:refs/heads/<branch>`
- direct hook failure simulation with a temporary fake `pnpm` that exits non-zero for `pnpm build`

## Lookup Notes

- Versioned hook entrypoint: `.githooks/pre-push`
- Shared push verifier: `scripts/verify-push.sh`
- AI-friendly wrapper: `scripts/safe-push.sh`
- Contributor instructions: `CONTRIBUTING.md`

## Expected Result

Contributors and agents can rely on a repo-managed push safety workflow: install hooks once per clone with `pnpm hooks:setup`, use normal `git push` with hook enforcement, or use `pnpm safe-push -- ...` for an explicit wrapper that verifies once and then pushes.
