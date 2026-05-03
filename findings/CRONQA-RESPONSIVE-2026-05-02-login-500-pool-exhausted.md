# CRON QA — Responsive Test Report

**Date:** 2026-05-02 23:58 UTC  
**Tester:** MCP Remote Browser (pwmcp-zonacnc)  
**Scope:** `new.zonacnc.com` — responsive testing (anonymous user)  
**Scenario:** CRON_QA responsive — 6 pages × 3 viewports  
**Email pool status:** test7–test30 (`.env.qa.email`) — ALL EXHAUSTED

---

## Executive Summary

| Metric | Result |
|--------|--------|
| Pages tested | 6 (Home, Search, Category, Pricing, Vendors, Registration) |
| Viewports tested | 3 (390×844 mobile, 768×1024 tablet, 1280×800 desktop) |
| Element overflow issues | **1 persistent** — `.zcnc-hero` on all viewports + new `.zonacnc-cta-inner` on desktop |
| Login page HTTP 500 | **CONFIRMED** — `/es/iniciar-sesion` still broken (BUG-001 REOPENED) |
| QA email pool | **Exhausted** — All 24 emails (test7–test30) already registered |
| Viewport meta tag | ✅ Correct on all pages |
| Registration page | ✅ Accessible, form loads correctly |
| Critical responsive breakage | **None** — layout behaves well across viewports |

---

## Detailed Results

### Page-by-Page Responsive Check

| Page | Mobile (390×844) | Tablet (768×1024) | Desktop (1280×800) |
|------|:---:|:---:|:---:|
| Home (`/es/`) | ⚠️ `.zcnc-hero` overflow | ⚠️ `.zcnc-hero` overflow | ⚠️ `.zcnc-hero` + `.zonacnc-cta-inner` overflow |
| Search (`/es/buscar?q=torno`) | ✅ Clean | ✅ Clean | ✅ Clean |
| Category (`/es/15-tornos`) | ✅ Clean | ✅ Clean | ✅ Clean |
| Pricing (`/es/pricing`) | ✅ Clean | ✅ Clean | ✅ Clean |
| Vendors (`/es/vendedores`) | ✅ Clean | ✅ Clean | ✅ Clean |
| Registration (`/es/?controller=registration`) | ✅ Clean | ✅ Clean | ✅ Clean |

### Overflow Issues — Homepage `.zcnc-hero`

| Viewport | scrollWidth | clientWidth | diffW | scrollHeight | clientHeight | diffH |
|----------|:-----------:|:-----------:|:-----:|:-----------:|:------------:|:-----:|
| Mobile (390×844) | 468px | 390px | **78px** | 399px | 266px | **133px** |
| Tablet (768×1024) | 922px | 768px | **154px** | 253px | 168px | **85px** |
| Desktop (1280×800) | 1536px | 1280px | **256px** | 253px | 168px | **85px** |

### Overflow Issues — Desktop `.zonacnc-cta-inner`

| Element | scrollWidth | clientWidth | diffW | scrollHeight | clientHeight | diffH |
|---------|:-----------:|:-----------:|:-----:|:-----------:|:------------:|:-----:|
| `div.zonacnc-cta-inner` | 1220px | 1200px | **20px** | 339px | 299px | **40px** |

---

## Critical Issues

### CRIT-001: Login page HTTP 500 (REOPENED)
- **URL:** `https://new.zonacnc.com/es/iniciar-sesion`
- **Error:** `net::ERR_HTTP_RESPONSE_CODE_FAILURE`
- **Impact:** Blocks all authenticated testing. Users cannot log in.
- **Status:** Unchanged from previous reports. Requires backend fix.

### CRIT-002: QA email pool exhausted
- **Range:** `test7@zonacnc.com` through `test30@zonacnc.com` — all 24 emails registered
- **Impact:** Cannot create fresh accounts for authenticated testing
- **Recommendation:** Add new test accounts (test31+) to `.env.qa.email` or recycle unused accounts

### BUG-003 (PERSISTENT): `.zcnc-hero` overflow
- Affects all viewports. Decorative background content clipped.
- Visible content not affected (overflow hidden).
- Reoccurs since previous report.

---

## Responsive Assessment

- **Viewport meta tag:** ✅ Correct on all pages (`width=device-width, initial-scale=1`)
- **Mobile navigation:** Hamburger menu works correctly
- **Search page:** Clean across all viewports
- **Category page:** Grid layout adapts well
- **Pricing page:** Plan cards stack vertically on mobile, grid on desktop
- **Vendors page:** Directory style adapts well
- **Registration form:** All fields accessible and properly laid out on mobile

---

## Screenshots

- `screenshots/responsive-home-mobile-20260502.png` — Homepage mobile
- `screenshots/login-500-error-20260502.png` — Login page HTTP 500 error
- `screenshots/responsive-pricing-mobile-20260502.png` — Pricing page mobile

---

## Recommendations

1. **Fix login page 500 error** — highest priority, blocks authenticated flows
2. **Expand QA email pool** — add test31+ or recycle old accounts
3. **Fix `.zcnc-hero` overflow** — background decoration exceeds container
4. **Fix `.zonacnc-cta-inner` overflow** — content slightly exceeds container on desktop
5. **Rest of responsive layout is solid** — no other issues found
