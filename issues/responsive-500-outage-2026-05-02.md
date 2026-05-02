# Issue: Site-wide HTTP 500 Outage — Responsive Testing Blocked

**Reported:** 2026-05-02 14:43 UTC  
**Reporter:** CRON_QA (responsive focus, test7@zonacnc.com)  
**Severity:** 🔴 Critical  
**Component:** PrestaShop/PHP application server  

## Description

All public pages on `new.zonacnc.com` return **HTTP 500 with empty body**. The site is completely unreachable for all users. This blocks registration, browsing, checkout, and responsive testing.

## Reproduction

```bash
curl -sL https://new.zonacnc.com/es/
# → HTTP 500, body: empty (0 bytes)
```

Any public URL redirects to localized path then crashes:
- `https://new.zonacnc.com/` → 301 → `/es/` → 500
- `https://new.zonacnc.com/es/iniciar-sesion` → 500
- `https://new.zonacnc.com/es/8-centros-de-mecanizado` → 500

## Technical Details

| Detail | Value |
|--------|-------|
| Server | nginx |
| PHP | 8.3.30 |
| Platform | PrestaShop |
| Headers | `X-Powered-By: PHP/8.3.30` |
| Response body | Empty (0 bytes) |
| Static assets | ✅ sitemap.xml (200), robots.txt (200) |
| API | `/api` returns 401 (isolated, expected) |

## Impact

- **15 responsive test combinations** (5 pages × 3 viewports) all blocked
- User registration impossible (no email confirmation flow to test)
- All e-commerce functionality inaccessible
- Previous working state: 13:57 UTC (test22@zonacnc.com, all passing)

## Likely Cause

PHP fatal error during PrestaShop application bootstrap. Static assets served directly by nginx work fine (sitemap.xml, robots.txt). The PHP application crashes on every request, suggesting a database connection failure, missing dependency, or corrupted cache configuration.

## Suggested Actions

1. Check PHP error logs on server
2. Verify database connection status
3. Check PrestaShop cache directories (`/var/cache/`, `/cache/`)
4. Review recent deployments between 13:57 UTC and 14:41 UTC
5. Restart PHP-FPM service
6. Enable PHP error display temporarily for debugging
