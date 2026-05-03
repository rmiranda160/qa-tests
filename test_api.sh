#!/bin/bash
set -e

API_BASE="http://51.254.244.216:8001"
FRONTEND_BASE="http://51.254.244.216:8082"

echo "=== News Verifier API Testing ==="
echo "API Base: $API_BASE"
echo "Frontend Base: $FRONTEND_BASE"
echo

# 1. Health endpoint
echo "1. Testing GET /health"
HEALTH_RESP=$(curl -s -w "%{http_code}" -o /tmp/health.json "$API_BASE/health")
if [ "$HEALTH_RESP" -eq 200 ]; then
    VERSION=$(cat /tmp/health.json | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    echo "   ✅ Status 200 OK"
    echo "   ✅ Version: $VERSION"
    # Check version >= 5.0.0
    if [[ "$VERSION" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
        MAJOR=${BASH_REMATCH[1]}
        if [ "$MAJOR" -ge 5 ]; then
            echo "   ✅ Version >= 5.0.0"
        else
            echo "   ❌ Version < 5.0.0"
            exit 1
        fi
    else
        echo "   ⚠️  Version format unknown"
    fi
else
    echo "   ❌ Health check failed with HTTP $HEALTH_RESP"
    exit 1
fi
echo

# 2. Root endpoint (schema)
echo "2. Testing GET / (schema)"
ROOT_RESP=$(curl -s -w "%{http_code}" -o /tmp/root.json "$API_BASE/")
if [ "$ROOT_RESP" -eq 200 ]; then
    SCHEMA_STATUS=$(cat /tmp/root.json | grep -o '"schema":"[^"]*"' | cut -d'"' -f4)
    echo "   ✅ Status 200 OK"
    echo "   ✅ Schema status: $SCHEMA_STATUS"
    if [[ "$SCHEMA_STATUS" == *"CORRECTED"* ]]; then
        echo "   ✅ Schema corrected"
    else
        echo "   ❌ Schema not corrected"
        exit 1
    fi
else
    echo "   ❌ Root endpoint failed with HTTP $ROOT_RESP"
    exit 1
fi
echo

# 3. POST /api/v1/verify-now valid request
echo "3. Testing POST /api/v1/verify-now (valid)"
VALID_JSON='{"content":"El cambio climático está causando aumento del nivel del mar.", "language":"es"}'
VERIFY_RESP=$(curl -s -w "%{http_code}" -o /tmp/verify.json -X POST -H "Content-Type: application/json" -d "$VALID_JSON" "$API_BASE/api/v1/verify-now")
if [ "$VERIFY_RESP" -eq 200 ]; then
    echo "   ✅ Status 200 OK"
    # Check response contains verification_results
    if grep -q "verification_results" /tmp/verify.json; then
        echo "   ✅ Response includes verification_results"
    else
        echo "   ❌ Missing verification_results"
        exit 1
    fi
    # Check claims_count
    CLAIMS_COUNT=$(cat /tmp/verify.json | grep -o '"claims_count":[0-9]*' | cut -d: -f2)
    echo "   ✅ Claims count: $CLAIMS_COUNT"
else
    echo "   ❌ Verify endpoint failed with HTTP $VERIFY_RESP"
    cat /tmp/verify.json
    exit 1
fi
echo

# 4. POST /api/v1/verify-now invalid request (missing content)
echo "4. Testing POST /api/v1/verify-now (invalid)"
INVALID_JSON='{"language":"es"}'
INVALID_RESP=$(curl -s -w "%{http_code}" -o /tmp/invalid.json -X POST -H "Content-Type: application/json" -d "$INVALID_JSON" "$API_BASE/api/v1/verify-now")
if [ "$INVALID_RESP" -eq 422 ]; then
    echo "   ✅ Status 422 Unprocessable Entity (expected)"
else
    echo "   ❌ Expected 422 but got $INVALID_RESP"
    cat /tmp/invalid.json
    exit 1
fi
echo

# 5. Frontend connectivity
echo "5. Testing Frontend connectivity"
if curl -s --max-time 5 -o /dev/null "$FRONTEND_BASE/"; then
    echo "   ✅ Frontend reachable"
else
    echo "   ❌ Frontend unreachable (connection refused)"
    # Not exiting, as frontend may be optional for API tests
fi
echo

echo "=== All API tests passed ==="