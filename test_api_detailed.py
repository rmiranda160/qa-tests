#!/usr/bin/env python3
import requests
import json
import sys

API_BASE = "http://51.254.244.216:8001"

def test_health():
    print("Testing /health")
    resp = requests.get(f"{API_BASE}/health")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert data.get("version") >= "5.0.0", f"Version {data.get('version')} < 5.0.0"
    assert data.get("schema_status") == "CORRECTED", f"Schema status not CORRECTED: {data.get('schema_status')}"
    print("  ✅ Health OK")

def test_root():
    print("Testing /")
    resp = requests.get(f"{API_BASE}/")
    assert resp.status_code == 200
    data = resp.json()
    assert "schema" in data
    assert "CORRECTED" in data["schema"]
    print("  ✅ Root OK")

def test_verify_valid():
    print("Testing POST /api/v1/verify-now valid")
    payload = {"content": "El cambio climático está causando aumento del nivel del mar.", "language": "es"}
    resp = requests.post(f"{API_BASE}/api/v1/verify-now", json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert "verification_results" in data
    assert "claims_count" in data
    assert "browser_status" in data
    print(f"  ✅ Verify valid OK, claims: {data['claims_count']}")

def test_verify_missing_content():
    print("Testing POST /api/v1/verify-now missing content")
    payload = {"language": "es"}
    resp = requests.post(f"{API_BASE}/api/v1/verify-now", json=payload)
    assert resp.status_code == 422, f"Expected 422, got {resp.status_code}"
    print("  ✅ Missing content validation OK")

def test_verify_empty_content():
    print("Testing POST /api/v1/verify-now empty content")
    payload = {"content": "", "language": "es"}
    resp = requests.post(f"{API_BASE}/api/v1/verify-now", json=payload)
    # Should either 422 or 200 with no claims
    if resp.status_code == 200:
        data = resp.json()
        assert data.get("claims_count") == 0
        print("  ✅ Empty content handled (no claims)")
    elif resp.status_code == 422:
        print("  ✅ Empty content validation (422)")
    else:
        raise AssertionError(f"Unexpected status {resp.status_code}")

def test_verify_long_content():
    print("Testing POST /api/v1/verify-now long content")
    # Generate long string
    long_content = "x " * 5000
    payload = {"content": long_content, "language": "es"}
    resp = requests.post(f"{API_BASE}/api/v1/verify-now", json=payload, timeout=30)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    # Should process
    print(f"  ✅ Long content OK, status: {data.get('status')}")

def test_verify_different_language():
    print("Testing POST /api/v1/verify-now language=en")
    payload = {"content": "Climate change is causing sea level rise.", "language": "en"}
    resp = requests.post(f"{API_BASE}/api/v1/verify-now", json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert "verification_results" in data
    print(f"  ✅ English language OK, claims: {data['claims_count']}")

def test_verify_unsupported_language():
    print("Testing POST /api/v1/verify-now language=xx")
    payload = {"content": "test", "language": "xx"}
    resp = requests.post(f"{API_BASE}/api/v1/verify-now", json=payload)
    # Might still process with default language
    if resp.status_code == 200:
        print("  ✅ Unsupported language handled (defaulted)")
    elif resp.status_code == 422:
        print("  ✅ Unsupported language validation (422)")
    else:
        print(f"  ⚠️  Unexpected status {resp.status_code}")

def test_response_schema():
    print("Testing response schema consistency")
    payload = {"content": "La vacuna COVID-19 es segura y efectiva.", "language": "es"}
    resp = requests.post(f"{API_BASE}/api/v1/verify-now", json=payload)
    data = resp.json()
    required_keys = ["status", "claims_count", "browser_status", "verification_results", "note"]
    for key in required_keys:
        assert key in data, f"Missing key {key}"
    # verification_results should be list
    assert isinstance(data["verification_results"], list)
    if data["verification_results"]:
        for claim in data["verification_results"]:
            assert "claim" in claim
            assert "verification_status" in claim
            assert "confidence" in claim
            assert "summary" in claim
            assert "sources" in claim
    print("  ✅ Response schema OK")

def main():
    try:
        test_health()
        test_root()
        test_verify_valid()
        test_verify_missing_content()
        test_verify_empty_content()
        test_verify_long_content()
        test_verify_different_language()
        test_verify_unsupported_language()
        test_response_schema()
        print("\n🎉 All tests passed!")
        return 0
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())