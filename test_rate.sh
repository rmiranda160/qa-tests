#!/bin/bash
URL="https://contentoai.cenarbe.com/api/submit_waitlist.php"
success=0
fail=0
for i in {1..20}; do
    email="test$(date +%s%N)@example.com"
    response=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"nombre\":\"RateTest\",\"email\":\"$email\",\"plan\":\"basic\"}" "$URL")
    if echo "$response" | grep -q "success"; then
        echo "Request $i: success"
        ((success++))
    else
        echo "Request $i: failed - $response"
        ((fail++))
    fi
    sleep 0.5
done
echo "Total success: $success"
echo "Total fail: $fail"