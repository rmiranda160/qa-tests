# CRON_QA Results
**Focus Area:** responsive  
**Date:** 2026-05-03 23:47 UTC  
**Duration:** ~15 min (within 30 min cap)  
**Target:** new.zonacnc.com  
**Account:** N/A (all test accounts locked out)  

## Summary
✅ **Responsive testing completed on 6 public pages × 3 viewports (375px, 768px, 1440px)**

### Pages tested:
- Homepage (`/es/`)
- Pricing (`/es/pricing`)
- Category: Maquinaria Metal (`/es/28-maquinaria-metal`)
- Search (`/es/buscar`)
- Login (`/es/iniciar-sesion`)
- Registration (`/?controller=registration`)

### Key Findings (5 bugs):
1. **Category page: 47 small touch targets at mobile** (WCAG 2.5.5 FAIL) — HIGH
2. **Hero clipping at all viewports** (75px–256px overflow hidden)
3. **Registration page bare `<title>`** — "zonacnc.com" instead of descriptive
4. **Persistent SSO console error** on ALL pages
5. **QA pool lockout** — all passwords changed, IMAP unreachable

### Status by Criterion:
| Criterion | Status |
|-----------|--------|
| Viewport meta tag | ✅ Correct |
| No horizontal overflow | ✅ All pages |
| Bootstrap grid | ✅ col-md, col-lg |
| Mobile nav (hamburger/offcanvas) | ✅ Present |
| Touch targets ≥44px | ❌ FAIL (47 on category) |
| Hero content overflow | ❌ Clipping all viewports |
| Page titles | ❌ Registration generic |
| Console errors | ❌ 1 SSO error/page |

## Files Updated
- `findings/CRONQA-2026-05-03-responsive-v10-login-blocked-public-pages.md` — Full finding report
