#!/usr/bin/env bash
set -euo pipefail

URL="${1:-}"
MODE="${2:-smoke}"

if [ -z "$URL" ]; then
  echo '{"ok": false, "error": "Missing URL"}'
  exit 1
fi

# Run playwright tester
cd "$(dirname "$0")"
RESULTS_DIR="$(pwd)/playwright-tester/results"
export RESULTS_DIR

# Run Node script and capture output
STDERR_FILE=$(mktemp)
STDOUT=$(node playwright-tester/index.js "$URL" "$MODE" 2>"$STDERR_FILE")
EXIT_CODE=$?
STDERR=$(cat "$STDERR_FILE")
rm "$STDERR_FILE"

if [ $EXIT_CODE -eq 0 ]; then
  # Success: stdout already contains JSON with required fields
  echo "$STDOUT"
else
  # Error
  echo "{
    \"ok\": false,
    \"stdout\": \"\",
    \"stderr\": \"${STDERR//\"/\\\"}\",
    \"resultsDir\": \"\"
  }"
fi