# Responsive Test Report — new.zonacnc.com

**Date:** 2026-05-03 (04:24-04:30 UTC)  
**Tester:** MCP Remote Browser (pwmcp-zonacnc)  
**Attempted User:** test7@zonacnc.com (all test7-test30 exhausted)  
**Scope:** CRON_QA — Responsive + auth status verification  
**Cap:** 30 min  

---

## 🚨 AUTH-001: Login / My Account HTTP 500 — STILL BROKEN (Day 3)

| Property | Value |
|----------|-------|
| **URL (ES)** | `https://new.zonacnc.com/es/iniciar-sesion` |
| **URL (EN)** | `https://new.zonacnc.com/en/login` |
| **URL (My Account ES)** | `https://new.zonacnc.com/es/mi-cuenta` |
| **HTTP Status** | **500 Internal Server Error** (ERR_HTTP_RESPONSE_CODE_FAILURE) |
| **Status** | ⛔ Still broken — same as 2026-05-02 and 2026-05-03 reports |
| **Days affected** | 3+ (since at least 2026-05-02) |

## 🚧 AUTH-003: QA Email Pool Exhausted

All 24 test accounts (test7–test30@zonacnc.com) remain registered:
- test7@zonacnc.com ❌ — "La dirección de correo electrónico ya está en uso" (verified 04:25 UTC)

**Impact:** No test accounts available for registration. Login is only possible path, but it's broken (500).

---

## Responsive Testing Results (Public Pages)

### Home Page (`/es/`)

| Viewport | Overflow Issues | Status |
|----------|----------------|--------|
| **Mobile** (390×844) | `.zcnc-hero` scrollWidth 468 > 390 (clipped via overflow:hidden) | ⚠️ Minor |
| **Tablet** (768×1024) | `.zcnc-hero` scrollWidth 922 > 768 (clipped via overflow:hidden) | ⚠️ Minor |
| **Desktop** (1440×900) | `.zcnc-hero` scrollWidth 1728 > 1440 (clipped via overflow:hidden) | ⚠️ Minor |

**Note:** `.zcnc-hero` has `overflow:hidden` CSS, so content is intentionally clipped. This is a minor cosmetic issue — the hero background/decoration extends beyond the container width on all viewports. Not user-visible.

### Search Page (`/es/buscar?search_query=torno`)

| Viewport | Overflow Issues | Status |
|----------|----------------|--------|
| **Mobile** (390×844) | ✅ None | Clean |
| **Tablet** (768×1024) | ✅ None | Clean |
| **Desktop** (1440×900) | ✅ None | Clean |

### Category Page (`/es/28-maquinaria-metal`)

| Viewport | Overflow Issues | Status |
|----------|----------------|--------|
| **Mobile** (390×844) | ✅ None (structural) / Minor text overflow in hidden/offscreen elements | Clean |
| **Tablet** (768×1024) | ✅ None | Clean |
| **Desktop** (1440×900) | ✅ None | Clean |

### Pricing Page (`/es/module/zonacncplans/pricing`)

| Viewport | Overflow Issues | Status |
|----------|----------------|--------|
| **Mobile** (390×844) | ✅ None | Clean |
| **Tablet** (768×1024) | ✅ None | Clean |

---

## Summary

| Finding | Severity | Status |
|---------|----------|--------|
| AUTH-001: Login/My Account HTTP 500 | **Critical** | Still broken (Day 3) |
| AUTH-003: QA email pool exhausted | Low | No free accounts available |
| RESP-001: `.zcnc-hero` minor overflow (all VPs) | Low | CSS `overflow:hidden` masks it |
| Responsive layout (search, category, pricing) | ✅ Pass | No regressions detected |

## Recommendations

1. **Fix authentication system urgently** — AUTH-001 has been broken for 3+ days. `/es/iniciar-sesion`, `/en/login`, and `/es/mi-cuenta` all return HTTP 500.
2. Allocate new test accounts (test31+) or implement account recycling.
3. `.zcnc-hero` overflow is cosmetic — review hero CSS if broader layout changes are planned.

---

**Testing completed at:** 2026-05-03 04:30 UTC  
**Total time:** ~6 minutes (within 30-min cap)
