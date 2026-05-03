# Responsive Test Report — new.zonacnc.com

**Date:** 2026-05-03 (03:31–03:33 UTC)  
**Tester:** MCP Remote Browser (pwmcp-zonacnc)  
**Email:** test7@zonacnc.com (all test7–test30 accounts exhausted from prior runs)  
**Scope:** CRON_QA — Responsive (1 escenario, hard cap 30 min)

---

## 1. Responsive Layout Results

### Pages tested: 4 public pages × 3 viewports = 12 checks

| Page | Desktop (1440×900) | Tablet (768×1024) | Mobile (390×844) |
|------|:---:|:---:|:---:|
| **Home** (`/es/`) | ✅ Clean (0 overflow) | ✅ Clean | ✅ Clean |
| **Search** (`/es/buscar?search_query=torno`) | ✅ Clean | ✅ Clean | ✅ Clean |
| **Category** (`/es/28-maquinaria-metal`) | ✅ Clean | ✅ Clean | ✅ Clean |
| **Pricing** (`/es/module/zonacncplans/pricing`) | ✅ Clean | ✅ Clean | ✅ Clean |

### Viewport totals

| Viewport | Overflow Issues | Layout Issues |
|----------|:--------------:|:-------------:|
| Desktop (1440×900) | 0 ✅ | 0 ✅ |
| Tablet (768×1024) | 0 ✅ | 0 ✅ |
| Mobile (390×844) | 0 ✅ | 0 ✅ |

**No horizontal overflow, no text overflow, no layout breakage detected on any public page.**

---

## 2. Auth Status (BLOCKER — Day 3)

### AUTH-001: Login/My Account/Registration HTTP 500

| URL | Status | Detail |
|-----|--------|--------|
| `https://new.zonacnc.com/es/iniciar-sesion` | 🔴 HTTP 500 | `net::ERR_HTTP_RESPONSE_CODE_FAILURE` |
| `https://new.zonacnc.com/en/login` | 🔴 HTTP 500 | `net::ERR_HTTP_RESPONSE_CODE_FAILURE` |
| `https://new.zonacnc.com/es/iniciar-sesion?create_account=1` | 🔴 HTTP 500 | Registration also broken |

**Status:** Auth system still returning HTTP 500 on **Day 3** (since 2026-05-01). Registration/login impossible.

### AUTH-003: QA Email Pool Exhausted
All 24 accounts (test7@zonacnc.com through test30@zonacnc.com) have been registered in prior runs. No registration possible even if auth were working. New accounts (test31+) needed.

---

## 3. Console Errors (Non-critical)

| Error | Source | Impact |
|-------|--------|--------|
| `Provider's accounts list is empty` | GSI | Expected — no Google user signed in |
| `FedCM get() rejects with NetworkError` | Google Identity Services | Expected without Google credentials |

Neither error affects responsive layout or user experience on public pages.

---

## 4. Summary

| Finding | Severity | Status |
|---------|----------|--------|
| Responsive layout (public pages) | ✅ Pass | No regressions — 12/12 checks clean |
| AUTH-001: Login/Registration HTTP 500 | **🔴 Critical** | Day 3 ongoing — blocks authenticated testing |
| AUTH-003: QA pool exhausted | Medium | All test7–test30 used; allocation needed |
| Console errors (GSI/FedCM) | ✅ Info | Expected behavior, no user-facing impact |

---

## 5. Recommendations

1. **🔴 CRITICAL: Fix auth system** — Login/register HTTP 500 has blocked all authenticated flows for 3 consecutive days
2. Allocate new test accounts (test31@zonacnc.com through test35@zonacnc.com)
3. Responsive layout remains solid on all public pages — no CSS/layout changes needed

---

**Testing completed at:** 2026-05-03 03:33 UTC  
**Total time:** ~3 minutes (well within 30-min cap)
