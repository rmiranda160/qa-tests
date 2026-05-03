# CRON QA Report: Stripe Billing — Site Outage (HTTP 500)

**Date:** 2026-05-02 14:38 UTC  
**Focus Area:** stripe-billing  
**Tester:** test28@zonacnc.com  
**Site:** new.zonacnc.com  
**Duration:** ~5 min (aborted — site unreachable)

---

## Test Scenario: Business Plan Subscription (Intended)

**Intended test:** Register fresh user (test28@zonacnc.com) → register vendor → subscribe to **Business Plan (199€/month)** → verify Stripe Checkout → verify post-subscription state.

## Result: ❌ BLOCKED — Site Outage

### Description
The site **new.zonacnc.com** is completely down, returning **HTTP 500 Internal Server Error** on every page. No public pages are serving content.

### Evidence

| Route | HTTP Status | Body |
|-------|-------------|------|
| `https://new.zonacnc.com/` | 301 → `/es/` | Empty (0 bytes) |
| `https://new.zonacnc.com/es/` | **500** | Empty (0 bytes) |
| `https://new.zonacnc.com/es/pricing` | **500** | Empty (0 bytes) |
| `https://new.zonacnc.com/es/iniciar-sesion` | **500** | Empty (0 bytes) |
| `https://new.zonacnc.com/es/module/zonacncplans/pricing` | **500** | Empty (0 bytes) |
| `https://new.zonacnc.com/en/pricing` | **500** | Empty (0 bytes) |
| `https://new.zonacnc.com/en/login` | **500** | Empty (0 bytes) |
| `https://new.zonacnc.com/module/zonacncplans/pricing` | **500** | Empty (0 bytes) |
| `https://new.zonacnc.com/es/mi-cuenta` | 302 → iniciar-sesion → **500** | — |

### Server Response Headers (consistent across all 500s)
```
HTTP/2 500
server: nginx
date: Sat, 02 May 2026 14:39:xx GMT
content-type: text/html; charset=utf-8
content-length: 0
x-powered-by: PHP/8.3.30
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(self), microphone=(), camera=(), payment=(self)
strict-transport-security: max-age=31536000; includeSubDomains
x-robots-tag: noindex, nofollow, noarchive
cache-control: no-store, no-cache, must-revalidate
pragma: no-cache
set-cookie: PrestaShop-0c9a7c061... (PrestaShop session cookie)
```

### API Endpoint
- `https://new.zonacnc.com/api` → **401** (Unauthorized — server functional, PHP running)
- Indicates PHP/nginx is operational but PrestaShop application crashes on page rendering.

### Timing
- **Last successful test:** 2026-05-02 13:50 UTC (test27 — Starter plan subscription flow completed successfully)
- **Outage detected:** 2026-05-02 14:38 UTC
- **Outage duration (so far):** ~50+ minutes

### Screenshot
- Browser shows `ERR_HTTP_RESPONSE_CODE_FAILURE` — no page content rendered

### Diagnostic Notes
- The empty body (content-length: 0) with 500 status suggests a **PHP fatal error** (uncaught exception, syntax error from deployment, or missing class/file).
- The server IS responding (PHP/8.3.30 active, session cookies set), but the application crashes before generating any output.
- Could be related to a **recent deployment or configuration change** between 13:50–14:38 UTC.

### Impact
- Stripe billing flow **completely blocked**
- All site functionality **unavailable** to end users
- No registration, no login, no pages render

### Recommended Actions
1. Check PHP error logs on the server (`/var/log/php-fpm/` or similar)
2. Verify if there was a recent deploy or code push
3. Check PrestaShop error log for the fatal error
4. Consider rolling back the last change if this is a deployment issue

---

## Labels
qa-stripe-billing, site-outage, critical, http-500
