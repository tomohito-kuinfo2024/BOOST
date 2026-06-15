#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

nohup "$ROOT_DIR/scripts/dev.sh" > "$ROOT_DIR/.vite.log" 2>&1 &
echo $! > "$ROOT_DIR/.vite.pid"
