---
title: "RESP-MEIN-KONTO-DE-404 — German My Account page returns 404"
type: finding
severity: P3
focus_area: responsive
cron_id: 53983183-66c6-4b72-9b21-404aac116c60
created: 2026-05-11T11:52:00Z
site: new.zonacnc.com
---

# FINDING: German `/de/mein-konto` returns 404

**Severity:** P3
**URL:** `https://new.zonacnc.com/de/mein-konto`
**Detected:** 2026-05-11 11:52 UTC
**Cron session:** `53983183-66c6-4b72-9b21-404aac116c60`

## Description

The German-language My Account page at `/de/mein-konto` returns HTTP 404, while the equivalent pages in other languages work correctly:

| Language | URL | Status | Expected |
|----------|-----|--------|----------|
| ES | `/es/mi-cuenta` | 302 → login ✅ | 302 |
| EN | `/en/my-account` | 302 → login ✅ | 302 |
| FR | `/fr/mon-compte` | 302 → login ✅ | 302 |
| **DE** | `/de/mein-konto` | **404 🚨** | 302 |

## Impact

- German-speaking users cannot access their account section
- The login redirect guard is working for ES/EN/FR but missing entirely for DE
- The 404 page responsive infrastructure works correctly (viewport, offcanvas, BS grid, hreflang, ARIA all present)

## Root Cause Hypothesis

Friendly URL routing rule for German "mein-konto" is not configured in PrestaShop's URL rewriting. The route may use a different slug than the expected "mein-konto" or may be missing from the SEO & URLs configuration.

## Responsive Infrastructure (404 page)

| Component | Status |
|-----------|--------|
| Viewport meta tag | ✅ 1 |
| Offcanvas elements | ✅ 12 |
| Bootstrap grid cols | ✅ 19 |
| Hreflang tags | ✅ 12 |
| ARIA attributes | ✅ 175 |
| Mobile=Desktop structural match | ✅ 100% (4 diff lines, all dynamic) |

## Related Sessions

- [[qa-cron-2026-05-11-1152-responsive]] (detection session)
- Account pipeline last full check: [[qa-cron-2026-05-09-2325]]
- Auth pages responsive: [[qa-cron-2026-05-11-0316-responsive-auth-regression]] (100% PASS, DE mein-konto not tested)

## Recommended Fix

1. Verify PrestaShop SEO & URLs configuration for German "My Account" page
2. Ensure friendly URL `/de/mein-konto` is mapped to the correct controller
3. Verify the URL rewrite rule exists in `.htaccess`
4. Regenerate `.htaccess` after adding the route if missing
