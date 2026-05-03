# Responsive Test Report — new.zonacnc.com

**Date:** 2026-05-03 (05:17-05:22 UTC)
**Tester:** MCP Remote Browser (pwmcp-zonacnc)  
**Attempted User:** test7@zonacnc.com (range test7-test30 all exhausted)  
**Scope:** CRON_QA — Responsive + Auth Status  
**Cap:** 30 min (completed in ~5 min)

---

## 🚨 AUTH-001: Login / My Account HTTP 500 — STILL BROKEN (Day 3+)

| Property | Value |
|----------|-------|
| **URL (ES)** | `https://new.zonacnc.com/es/iniciar-sesion` |
| **HTTP Status** | **500 Internal Server Error** (ERR_HTTP_RESPONSE_CODE_FAILURE) |
| **Status** | ⛔ **Still broken** — same error as reports from 2026-05-02 and earlier 2026-05-03 |
| **Days affected** | 3+ (since at least 2026-05-02) |

## 🚧 AUTH-003: QA Email Pool Exhausted

All tested QA accounts return "La dirección de correo electrónico ya está en uso":

| Email | Result |
|-------|--------|
| test7@zonacnc.com | ❌ Taken |
| test8@zonacnc.com | ❌ Taken |
| test30@zonacnc.com | ❌ Taken |
| test31@zonacnc.com | ❌ Taken |

**Impact:** No test accounts available for registration. Login flow is broken (HTTP 500). Cannot test authenticated/responsive behavior for logged-in users.

**Recommendation:** Allocate new test accounts (test32+) or implement account recycling/deletion system.

---

## Responsive Layout Results (Public Pages)

### Home Page (`/es/`)

| Viewport | Overflow Issues | Status |
|----------|----------------|--------|
| **Mobile** (390×844) | ✅ No document overflow | **PASS** |
| | `.zcnc-hero`: scrollWidth 468 > 390px (overflow:hidden) — cosmetic only | Minor |
| **Tablet** (768×1024) | ✅ No document overflow | **PASS** |
| | `.zcnc-hero`: scrollWidth 922 > 768px (overflow:hidden) — cosmetic only | Minor |
| **Desktop** (1440×900) | ✅ No document overflow | **PASS** |
| | `.zcnc-hero`: scrollWidth 1728 > 1440px (overflow:hidden) — cosmetic only | Minor |

**Note:** `.zcnc-hero` has CSS `overflow:hidden`, so the extra width is intentionally clipped. Not user-visible.

### Search Page (`/es/buscar?search_query=torno`)

| Viewport | Issues | Status |
|----------|--------|--------|
| **Mobile** (390×844) | ✅ None | **PASS** |
| **Tablet** (768×1024) | ✅ None | **PASS** |
| **Desktop** (1440×900) | ✅ None | **PASS** |

### Category Page (`/es/28-maquinaria-metal`)

| Viewport | Issues | Status |
|----------|--------|--------|
| **Mobile** (390×844) | ✅ None | **PASS** |
| **Tablet** (768×1024) | ✅ None | **PASS** |
| **Desktop** (1440×900) | ✅ None | **PASS** |

### Pricing Page (`/es/module/zonacncplans/pricing`)

| Viewport | Issues | Status |
|----------|--------|--------|
| **Mobile** (390×844) | ✅ None | **PASS** |
| **Tablet** (768×1024) | ✅ None | **PASS** |
| **Desktop** (1440×900) | ✅ None | **PASS** |

---

## Summary

| Finding | Severity | Status |
|---------|----------|--------|
| **AUTH-001**: Login/My Account HTTP 500 | **Critical** | ⛔ Still broken (Day 3+) |
| **AUTH-003**: QA email pool exhausted | Low | 24+ accounts all taken |
| **RESP-001**: `.zcnc-hero` minor overflow (all VPs) | Low | CSS `overflow:hidden` masks it |
| Responsive layout (search, category, pricing) | ✅ Pass | No regressions; all viewports clean |

## Comparison with Previous Report (v4)

| Aspect | v4 (04:24 UTC) | v5 (05:17 UTC) | Change |
|--------|----------------|----------------|--------|
| Login 500 | ⛔ Broken | ⛔ Broken | Unchanged |
| Email pool | All exhausted | All exhausted | Unchanged |
| Hero overflow | ⚠️ Minor | ⚠️ Minor | Unchanged |
| Search/category/pricing | ✅ Pass | ✅ Pass | Unchanged |

---

## Recommendations

1. **Fix authentication system urgently** — `/es/iniciar-sesion` has been returning HTTP 500 for 3+ days. This blocks all authenticated testing and user login.
2. **Allocate new test accounts** — Create test32+ or implement account recycling.
3. **Hero overflow** — Cosmetic only; no user-facing impact due to `overflow:hidden`. Can be addressed in a future CSS cleanup.

---

**Testing completed at:** 2026-05-03 05:22 UTC  
**Total time:** ~5 min (within 30-min cap)  
**Test credentials used:** test7@zonacnc.com / ZonaCNC2026! (already registered)
