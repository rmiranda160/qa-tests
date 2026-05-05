#!/usr/bin/env bash
set -euo pipefail
RESULTS_DIR="/home/node/.openclaw/workspace-tester/continuous-testing/playwright-tester/results"
export RESULTS_DIR
mkdir -p "$RESULTS_DIR"
node /home/node/.openclaw/workspace-tester/continuous-testing/playwright-tester/compat-local.js "$1" "$2"
