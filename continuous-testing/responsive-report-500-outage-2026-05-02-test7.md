# 📱 Responsive QA Report — SITE OUTAGE HTTP 500
**Date:** 2026-05-02 14:43 UTC  
**Tester:** CRON_QA (tester agent, responsive focus)  
**Focus:** Responsive layout — BLOCKED by site outage  
**Base URL:** https://new.zonacnc.com/  
**User:** test7@zonacnc.com (registration intended, not possible)

## Test Result: ❌ FAIL — Site Unreachable

All public pages return HTTP 500 with empty body. Responsive testing cannot proceed.

## Site Status Check (2026-05-02 14:43 UTC)

| Path | HTTP Status | Body | Notes |
|------|:-----------:|:----:|-------|
| `https://new.zonacnc.com/` | 301 → 500 | Empty | Redirects to `/es/`, then crashes |
| `https://new.zonacnc.com/es/` | 500 | Empty | Main page — PHP fatal error |
| `https://new.zonacnc.com/en/` | 500 | Empty | English version also down |
| `https://new.zonacnc.com/es/iniciar-sesion` | 500 | Empty | Login page |
| `https://new.zonacnc.com/es/8-centros-de-mecanizado` | 500 | Empty | Category page |
| `https://new.zonacnc.com/es/15-tornos` | 500 | Empty | Category page |
| `https://new.zonacnc.com/es/mi-cuenta` | 302 → 500 | Empty | My account → login → crash |
| `https://new.zonacnc.com/api` | 401 | "Unauthorized" | API endpoint isolated — expected |
| `https://new.zonacnc.com/sitemap.xml` | 200 | 783KB ✅ | Static XML works — confirm server alive |
| `https://new.zonacnc.com/robots.txt` | 200 | 817B ✅ | Static text works |

## Server Info

- **Server:** nginx + PHP/8.3.30
- **Platform:** PrestaShop (confirmed via cookie `PrestaShop-0c9a7c061ac06c2a1733ae9ca3528403`)
- **Pre-launch:** robots.txt confirms "PRE-LANZAMIENTO — bloqueo total de indexación"
- **Body:** Empty (0 bytes) on all 500 responses — PHP fatal error, no debug output

## MCP Browser Behavior

The remote browser (pwmcp-zonacnc) cannot render the site at all:
- `page.goto()` throws `net::ERR_HTTP_RESPONSE_CODE_FAILURE` for HTTP 500 responses
- Browser shows `chrome-error://chromewebdata/` — cannot capture error page visual
- Static pages (sitemap.xml) load correctly via the browser

## Impact on Responsive Testing

Responsive testing requires 3 viewports (390×844 mobile, 768×1024 tablet, 1440×900 desktop) across core pages:
- Homepage `/es/`
- Search `/es/buscar`
- Categories `/es/8-centros-de-mecanizado`
- Pricing `/es/module/zonacncplans/pricing`
- Registration/Login `/es/iniciar-sesion`

**All 5 core pages × 3 viewports = 15 test combinations BLOCKED.**

## Previous Working State

The last successful responsive test (v2, 13:57 UTC with test22@zonacnc.com) showed all 12 viewport×page combinations passing:
- No horizontal overflow
- No container overflow
- All responsive breakpoints correct
- No console errors

The outage started between ~13:57 and ~14:41 UTC today.

## Verdict

**❌ CRITICAL FAIL** — Site-wide HTTP 500 outage. All responsive testing blocked. Requires immediate server/application investigation.

**Next steps when site recovers:** Re-register test7@zonacnc.com and re-run full responsive matrix.
