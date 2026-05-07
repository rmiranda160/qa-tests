# CRON QA Responsive — 2026-05-07 00:06 UTC

| Result | Finding | Issue | PR |
|--------|---------|-------|----|
| 🔴 BLOCKED | SITE-500-001 (persists) | TBD | TBD |

**Cron ID:** 53983183-66c6-4b72-9b21-404aac116c60  
**Focus Area:** responsive  
**Target:** https://new.zonacnc.com  
**Status:** 🔴 BLOCKED — Site-wide HTTP 500 persists since 2026-05-06 23:21 UTC  
**Previous run:** PR #229 (same cron ID, same finding, ~40 min ago)

---

## Site Status: HTTP 500 on All Pages

### Test Results (2026-05-07 00:06 UTC)

| URL | HTTP Status | Body Size | Notes |
|-----|------------|-----------|-------|
| `/` | 301 → `/es/` | 0 bytes | Redirect only |
| `/es/` | 500 | 0 bytes | Empty response |
| `/en/` | 500 | 0 bytes | Empty response |
| `/es/iniciar-sesion` | 500 | 0 bytes | Login page down |
| `/es/contactenos` | 500 | 0 bytes | Contact page down |
| `/es/28-maquinaria-metal` | 500 | 0 bytes | Category listing down |
| `/es/iniciar-sesion?create_account=1` | 302 | 0 bytes | Register redirect only |

### Server Environment
- **Server:** nginx + PHP/8.3.30 (PrestaShop)
- **SSL:** Valid Let's Encrypt cert (CN=new.zonacnc.com, expires Jul 16 2026)
- **Cookies:** PrestaShop session cookie set, but no HTML body returned
- **PHP:** Returns 500 with empty body — suspected PHP fatal error

### Comparison: Production Works
- `https://www.zonacnc.com/es/` → HTTP 200, full HTML (zonacnc.com production is functional)
- Only `new.zonacnc.com` is affected

### Outage Timeline
| Time (UTC) | Status | Source |
|-----------|--------|--------|
| 2026-05-06 12:18 | ✅ Working | CRONQA-RESPONSIVE-2026-05-06-1218 |
| 2026-05-06 17:05 | ✅ Working | RESONSIVE_REPORT_2026-05-06_1307 |
| 2026-05-06 20:45 | ✅ Working (last known good) | PR #229 |
| 2026-05-06 23:21 | ❌ HTTP 500 | PR #229 (first detection) |
| 2026-05-07 00:06 | ❌ HTTP 500 | This run (persists ~45 min) |

---

## Responsive Testing: NOT POSSIBLE

All responsive testing is blocked because:
1. No HTML content to evaluate — 0 bytes response body
2. Browser (Playwright/Chromium) refuses to render 500 error pages
3. Cannot test viewports, touch targets, overflow, or layout
4. Cannot log in or register to test authenticated pages
5. Cannot create test ads or verify email flows

### Email Verification (test7@zonacnc.com)
- Inbox: 49 emails
- Latest emails from previous billing tests (PR #230)
- No new emails generated (site access not possible)

---

## Recommendations
1. **Check PHP error logs** on new.zonacnc.com server
2. **Enable `_PS_MODE_DEV_`** in PrestaShop config to get error details
3. **Verify database connectivity** — most likely a DB connection failure
4. **Review recent deployments** between 20:45–23:21 UTC on May 6
5. **Set up monitoring** for site-wide 500 errors to detect outages faster
6. **Consider a rollback** to the last known good deployment

---

## Severity: 🔴 CRITICAL
- **Complete site unavailability** — all pages return 500
- **Duration:** ~45 minutes and counting
- **Impact:** Blocks all testing, all user access, all Stripe billing flows
- **No fallback or degraded mode available**

---

**Test Environment:**
- **Browser:** Chromium via MCP remote + curl CLI verification
- **Date:** 2026-05-07 00:06 UTC
- **Method:** HTTP status check (7 URLs) + browser accessibility check
