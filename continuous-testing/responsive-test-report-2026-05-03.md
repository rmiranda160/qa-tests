# Responsive & Functional Test Report — new.zonacnc.com

**Date:** 2026-05-03 (01:49-01:57 UTC)  
**Tester:** MCP Remote Browser (pwmcp-zonacnc)  
**Attempted User:** test7@zonacnc.com (confirmed all test7-test30 exhausted)  
**Scope:** CRON_QA — Responsive + auth status verification  
**Cap:** 30 min  

---

## 🚨 CRITICAL: Auth 500 Still Ongoing (Day 2)

### AUTH-001: Login page HTTP 500 — STILL BROKEN (REOPENED)
| Property | Value |
|----------|-------|
| **URL (ES)** | `https://new.zonacnc.com/es/iniciar-sesion` |
| **URL (EN)** | `https://new.zonacnc.com/en/login` |
| **HTTP Status** | **500 Internal Server Error** (ERR_HTTP_RESPONSE_CODE_FAILURE) |
| **Status** | ⛔ Still broken — same as 2026-05-02 report |
| **Days affected** | 2+ (since at least 2026-05-02) |

**Latest verification:** Attempted navigation to `/es/iniciar-sesion` at 01:56 UTC → `net::ERR_HTTP_RESPONSE_CODE_FAILURE`

### AUTH-003: QA Email Pool Exhausted
All 24 test accounts (test7–test30@zonacnc.com) remain registered:
- test7 ❌ — "La dirección de correo electrónico ya está en uso"
- test8 ❌ — already registered
- test9 ❌ — already registered
- test10 ❌ — already registered
- test15 ❌ — already registered
- test20 ❌ — already registered
- test25 ❌ — already registered
- test30 ❌ — already registered

**Impact:** No test accounts available for registration. Login is the only path, but it's broken (500).

---

## Responsive Testing Results (Public Pages)

### Search Page (`/es/buscar?search_query=torno`)

| Viewport | Overflow | Status |
|----------|----------|--------|
| **Mobile** (390×844) | ✅ None (390/390) | Clean |
| **Tablet** (768×1024) | ✅ None (768/768) | Clean |
| **Desktop** (1440×900) | ✅ None (1440/1440) | Clean |

### Home Page (`/es/`)

| Viewport | Overflow | Status |
|----------|----------|--------|
| **Desktop** (1440×900) | ✅ None (1440/1440) | Clean |
| **Mobile** (390×844) | ✅ None (390/390) | Clean |

No horizontal overflow or layout regressions detected on any public page tested.

---

## Summary

| Finding | Severity | Status |
|---------|----------|--------|
| AUTH-001: Login/My Account HTTP 500 | **Critical** | Still broken (Day 2) |
| AUTH-003: QA email pool exhausted | Low | No free accounts available |
| Responsive layout (public pages) | ✅ Pass | No regressions detected |

## Recommendations

1. **Fix authentication system urgently** — AUTH-001 has been broken for 2+ days
2. Allocate new test accounts (test31+) or implement account recycling
3. Responsive layout for public pages remains solid — no changes needed

---

**Testing completed at:** 2026-05-03 01:57 UTC  
**Total time:** ~8 minutes (within 30-min cap)
