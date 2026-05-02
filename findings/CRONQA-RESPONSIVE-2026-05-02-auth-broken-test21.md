# CRON_QA Finding: Login Page HTTP 500 — Registration Blocked

**Date:** 2026-05-02 22:23 UTC  
**Tester:** test21@zonacnc.com  
**Focus:** Responsive — CRON_QA  
**Scope:** `new.zonacnc.com`  

## Summary

**The login page at `/es/iniciar-sesion` returns HTTP 500 Internal Server Error.** All registration paths (`/es/registro`, `/es/register`, `/es/crear-cuenta`) return 404. User authentication is completely broken, making it impossible to register a new account, log in, or access any protected page.

## Details

| Endpoint | HTTP Status | Result |
|----------|-------------|--------|
| `GET /es/iniciar-sesion` | 500 | ❌ Internal Server Error |
| `GET /es/registro` | 404 | ❌ Not Found |
| `GET /es/register` | 404 | ❌ Not Found |
| `GET /es/crear-cuenta` | 404 | ❌ Not Found |
| `GET /es/mi-cuenta` | HTTP Error | ❌ Cannot access |

## Impact on Responsive Testing

The auth failure blocks:
- Registration flow (no new accounts can be created)
- Login (existing users cannot sign in)
- Post-login responsive testing (dashboard, seller pages)
- "Empezar gratis" flow (redirects to login)

## Responsive Testing Results (public pages)

| Area | Status | Notes |
|------|--------|-------|
| Homepage (390px) | ✅ Pass | No overflow, proper mobile nav |
| Homepage (768px) | ✅ Pass | Tablet breakpoints work |
| Homepage (1440px) | ✅ Pass | Full desktop layout |
| Search page (390px) | ✅ Pass | Slide-out sidebar, proper cards |
| Search page (768px) | ✅ Pass | Inline sidebar visible |
| Tornos category (390px) | ⚠️ Minor | Inconsistent card widths |
| Pricing page (390px) | ✅ Pass | Full-width cards, no overflow |

## Responsive Findings

1. **Login page 500 error** — 🔴 CRITICAL, blocks all auth
2. **16 small touch targets on mobile homepage** — Elements below 44px WCAG minimum
3. **27 small touch targets on mobile search page** — Same issue
4. **Inconsistent product card widths in category listing** — 138px and 234px cards in same row
5. **Login button at 40px** — Just below 44px mobile touch target recommendation

## Evidence

Console errors:
- `Provider's accounts list is empty.` (homepage)
- `Not signed in with the identity provider.` (broken auth pages)
