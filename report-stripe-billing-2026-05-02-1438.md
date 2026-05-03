# QA Report: Stripe Billing — Site Outage (HTTP 500)
**Date:** 2026-05-02 14:38 UTC  
**Tester:** test28@zonacnc.com  
**Site:** new.zonacnc.com  
**Duration:** ~5 min (aborted)  
**Status:** ❌ BLOCKED — full site outage

---

## Test Scenario: Business Plan Subscription (Intended)

**Intended:** Register fresh user (test28@zonacnc.com) → register vendor → subscribe to Business Plan (199€/month) → verify Stripe Checkout → verify post-subscription state.

## Result: Site Completely Down (HTTP 500)

The entire site **new.zonacnc.com** is returning **HTTP 500 Internal Server Error** on all public pages with empty body responses (content-length: 0).

### Key Evidence

| Ruta | HTTP Status |
|------|-------------|
| `https://new.zonacnc.com/es/` | 500 |
| `https://new.zonacnc.com/es/pricing` | 500 |
| `https://new.zonacnc.com/es/iniciar-sesion` | 500 |
| `https://new.zonacnc.com/en/pricing` | 500 |
| `https://new.zonacnc.com/api` | 401 (functional) |

### Server Response
```
HTTP/2 500 | x-powered-by: PHP/8.3.30 | content-length: 0
```
PHP/nginx active, session cookies being set, but PrestaShop crashes before rendering.

### Timing
- **Last successful test:** 13:50 UTC (test27 — Starter plan flow ✅)
- **Outage detected:** 14:38 UTC
- **Duration so far:** ~48+ minutes

## Findings

### F1: CRITICAL — Full Site Outage (HTTP 500)
- **Severity:** 🔴 Critical (blocking)
- **URL:** All routes on new.zonacnc.com
- **Impact:** All functionality blocked — registration, login, pricing, Stripe checkout, billing, entire site.
- **Suspected cause:** PHP fatal error (uncaught exception/syntax error) likely from a recent deployment or configuration change.

## Conclusion
❌ **Test aborted.** The site is completely down with HTTP 500 on all routes. Stripe billing cannot be tested until the outage is resolved. An issue has been filed.

**Total time:** ~5 min (within 30 min cap)
