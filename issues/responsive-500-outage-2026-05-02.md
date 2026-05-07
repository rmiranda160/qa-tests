# Issue: Site-wide HTTP 500 Outage — Responsive Testing Blocked (SITE-500-001, #231)

**Reported:** 2026-05-02 14:43 UTC  
**Last confirmed:** 2026-05-07 00:57 UTC  
**Reporter:** CRON_QA (responsive focus, test7@zonacnc.com)  
**Severity:** 🔴 Critical  
**Status:** 🔴 OPEN — Multi-day outage (5+ days recurring)  
**Component:** PrestaShop/PHP application server

## Update Log

| Date | Status | Details |
|------|--------|--------|
| 2026-05-02 14:43 | 🔴 First detected | Site-wide 500, all pages |
| 2026-05-03 | 🟢 Resolved | Site back online, QA passed |
| 2026-05-06 23:21 | 🔴 Recurred | Site-wide 500 again (SITE-500-001) |
| 2026-05-07 00:57 | 🔴 Persists | Still 500, Day 2+ of current outage |  

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
- **10+ consecutive CRON QA runs blocked** across responsive and stripe-billing focus areas
- Previous working state: 13:57 UTC May 2 (test22@zonacnc.com, all passing)
- Current outage: Day 2+ (since 2026-05-06 ~23:21 UTC)

## Likely Cause

PHP fatal error during PrestaShop application bootstrap. Static assets served directly by nginx work fine (sitemap.xml, robots.txt). The PHP application crashes on every request, suggesting a database connection failure, missing dependency, or corrupted cache configuration.

## Suggested Actions

1. Check PHP error logs on server
2. Verify database connection status
3. Check PrestaShop cache directories (`/var/cache/`, `/cache/`)
4. Review recent deployments between 13:57 UTC and 14:41 UTC
5. Restart PHP-FPM service
6. Enable PHP error display temporarily for debugging
