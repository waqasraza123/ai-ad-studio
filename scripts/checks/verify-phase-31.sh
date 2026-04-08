#!/usr/bin/env bash
set -euo pipefail

pnpm lint
pnpm test
pnpm build
pnpm typecheck

if [[ -n "${SMOKE_BASE_URL:-}" ]]; then
  pnpm smoke:runtime
fi

if [[ -n "${SMOKE_BASE_URL:-}" && -n "${SMOKE_BILLING_OPERATOR_SECRET:-}" ]]; then
  pnpm smoke:billing
fi
