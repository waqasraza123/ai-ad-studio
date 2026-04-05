#!/usr/bin/env bash
set -euo pipefail

pnpm lint
pnpm test
pnpm build
pnpm typecheck

if [[ -n "${SMOKE_BASE_URL:-}" ]]; then
  pnpm smoke:runtime
fi
