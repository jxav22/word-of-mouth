#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .next/standalone/server.js ]]; then
  mkdir -p .next/standalone/.next
  # Standalone output expects static + public beside server.js
  rm -rf .next/standalone/.next/static
  cp -R .next/static .next/standalone/.next/static
  if [[ -d public ]]; then
    cp -R public .next/standalone/public
  fi
  cd .next/standalone
  exec node server.js
fi

exec npx next start
