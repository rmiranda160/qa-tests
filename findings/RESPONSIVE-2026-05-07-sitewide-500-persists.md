# Finding: Site-wide HTTP 500 Persists — Responsive Testing BLOCKED (Day 2+)

**Found:** 2026-05-07 00:57 UTC  
**Reporter:** CRON_QA (responsive focus, test7@zonacnc.com)  
**Severity:** 🔴 Critical  
**Component:** PrestaShop/PHP application server, new.zonacnc.com  
**Related:** SITE-500-001 (#231), previous finding 2026-05-06T2321

## Description

`new.zonacnc.com` continues to return **HTTP 500 Internal Server Error** with empty body on all public-facing pages. This is now a multi-day outage (first detected 2026-05-06 ~23:21 UTC).

The site is completely unreachable for all users. This blocks:
- Responsive testing (3 viewports × all pages)
- User registration
- Browsing products
- Checkout flow
- Email verification flows

## Reproduction

```bash
# Main page redirects to /es/ then crashes
curl -sI https://new.zonacnc.com/
# → HTTP/2 301 → Location: /es/

curl -sI https://new.zonacnc.com/es/
# → HTTP/2 500
#   content-length: 0
#   x-powered-by: PHP/8.3.30

# All localized pages fail
curl -sI https://new.zonacnc.com/en/
# → HTTP/2 500

# Non-existent routes properly 404 (routing works)
curl -sI https://new.zonacnc.com/es/login
# → HTTP/2 404
```

## Technical Details

| Detail | Value |
|--------|-------|
| Server | nginx |
| PHP | 8.3.30 |
| Platform | PrestaShop (PrestaShop session cookie set) |
| Plesk | X-Powered-By: PleskLin |
| HTTP Status | 500 |
| Response body | Empty (0 bytes) |
| Routing | Working (404s for unknown paths, 500 on valid routes) |
| Geo cookie | Set correctly (`zonacnc_geo=ES%7Ces%7C0`) |
| Strict-Transport-Security | ✅ Present |
| CSP/X-Frame | ✅ Present |

## Previous Attempts

- 2026-05-06T2225: Responsive test run, same 500 blockage
- 2026-05-06T2321: Site-wide 500 first detected (SITE-500-001, #231)
- 2026-05-07T0050: Stripe billing run also blocked by same 500

## Email Check (test7@zonacnc.com)

- 50 emails in inbox
- Last 5: password reset confirmations, invoice payment notification, test message, welcome email
- No error alert emails from the platform about the outage

## Recommended Actions

1. Check PHP error logs on the server (`/var/log/plesk-php83-fpm/error.log` or similar)
2. Verify database connectivity (PrestaShop DB connection)
3. Check if a recent deployment or plugin update triggered the outage
4. Review nginx error logs for upstream PHP-FPM errors
5. Enable PrestaShop debug mode (`define('_PS_MODE_DEV_', true)` in config/defines.inc.php)

## Impact on QA

**Complete blockage.** No responsive testing possible until site recovers. 15 test combinations (5 pages × 3 viewports) all blocked.
