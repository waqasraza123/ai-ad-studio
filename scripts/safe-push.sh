#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

cd "${repo_root}"

if [[ "${1:-}" == "--" ]]; then
  shift
fi

echo "[safe-push] Ensuring versioned git hooks are installed"
git config core.hooksPath .githooks

"${repo_root}/scripts/verify-push.sh"

echo "[safe-push] Pushing with git push $*"
AI_AD_STUDIO_SKIP_PRE_PUSH_VERIFY=1 git push "$@"
