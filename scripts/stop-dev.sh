#!/usr/bin/env bash
set -euo pipefail

pids="$(ss -ltnp 2>/dev/null | sed -n 's/.*:517[0-9].*pid=\([0-9]*\).*/\1/p' | sort -u)"

if [ -z "$pids" ]; then
  echo "No Vite dev server found on ports 5170-5179."
  exit 0
fi

for pid in $pids; do
  kill "$pid"
  echo "Stopped process $pid."
done
