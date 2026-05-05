#!/usr/bin/env bash
set -euo pipefail
export RESULTS_DIR="/home/node/.openclaw/workspace-tester/continuous-testing/playwright-tester/results"
node /home/node/.openclaw/workspace-tester/continuous-testing/playwright-tester/compat.js "https://new.zonacnc.com" "responsive" 2>&1
