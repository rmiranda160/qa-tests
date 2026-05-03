#!/usr/bin/env bash
set -euo pipefail

echo "Starting first continuous testing cycle at $(date -u)"

# URLs and names
declare -A apps=(
    ["Cenarbe Bike"]="https://dev1.cenarbe.com/"
    ["ContentoAI"]="https://contentoai.cenarbe.com/"
    ["Villa Zocotin"]="https://villazocotin.cenarbe.com/"
)

FAILURES=()
SUCCESSES=()

for app in "${!apps[@]}"; do
    url="${apps[$app]}"
    echo "Testing $app ($url)..."
    response=$(cd "$(dirname "$0")" && ./run-playwright-tester.sh "$url" "smoke" 2>/dev/null || echo '{"ok":false}')
    ok=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(str(data.get('ok', 'false')).lower())" 2>/dev/null || echo false)
    if [[ "$ok" == "true" ]]; then
        echo "  PASS"
        SUCCESSES+=("$app")
    else
        echo "  FAIL"
        FAILURES+=("$app")
    fi
done

echo "=== CYCLE COMPLETE ==="
echo "Successes: ${#SUCCESSES[@]} - ${SUCCESSES[*]}"
echo "Failures: ${#FAILURES[@]} - ${FAILURES[*]}"

# Generate report
REPORT_FILE="/home/node/.openclaw/workspace-tester/continuous-testing/first-cycle-report.md"
cat > "$REPORT_FILE" <<EOF
# Continuous Testing - First Cycle
**Timestamp:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Status:** $([[ ${#FAILURES[@]} -eq 0 ]] && echo "✅ ALL PASS" || echo "❌ FAILURES DETECTED")

## Applications Tested

### Cenarbe Bike Rental
- URL: https://dev1.cenarbe.com/
- Mode: smoke
- Result: $(if [[ " ${SUCCESSES[*]} " =~ " Cenarbe Bike " ]]; then echo "✅ PASS"; else echo "❌ FAIL"; fi)

### ContentoAI
- URL: https://contentoai.cenarbe.com/
- Mode: smoke
- Result: $(if [[ " ${SUCCESSES[*]} " =~ " ContentoAI " ]]; then echo "✅ PASS"; else echo "❌ FAIL"; fi)

### Villa Zocotin
- URL: https://villazocotin.cenarbe.com/
- Mode: smoke
- Result: $(if [[ " ${SUCCESSES[*]} " =~ " Villa Zocotin " ]]; then echo "✅ PASS"; else echo "❌ FAIL"; fi)

## Summary
Total applications: 3
Passed: ${#SUCCESSES[@]}
Failed: ${#FAILURES[@]}

## Next Steps
- Continuous testing cycles will run every 5 minutes.
- Critical issues will trigger real‑time alerts.
- Detailed reports will be sent to CEO Miranda every 12 hours.

EOF

echo "Report saved to $REPORT_FILE"

# If failures, send alert
if [[ ${#FAILURES[@]} -gt 0 ]]; then
    echo "ALERT: Failures detected - ${FAILURES[*]}"
    # TODO: Send message via OpenClaw
fi