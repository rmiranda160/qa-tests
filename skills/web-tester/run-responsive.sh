#!/usr/bin/env bash
set -euo pipefail
cd /home/node/.openclaw/workspace-tester/continuous-testing
RESULTS_DIR="$(pwd)/playwright-tester/results"
export RESULTS_DIR
node playwright-tester/compat.js "$1" "$2"
