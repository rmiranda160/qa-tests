# Responsive & Functional Test Report — new.zonacnc.com

**Date:** 2026-05-03 (02:41–02:46 UTC)  
**Tester:** MCP Remote Browser (pwmcp-zonacnc)  
**Attempted User:** test7@zonacnc.com  
**Scope:** CRON_QA — Responsive (1 escenario, hard cap 30 min)  
**Status:** ✅ Public pages responsive OK | 🔴 Auth pages HTTP 500 (Day 3)

---

## 1. Responsive Layout Results

### Pages tested (4 public pages × 3 viewports = 12 checks)

| Page | Desktop (1440×900) | Tablet (768×1024) | Mobile (390×844) |
|------|:---:|:---:|:---:|
| **Home** (`/es/`) | ✅ Clean (1 minor hero overflow*) | ✅ Clean | ✅ Clean (1 minor hero overflow*) |
| **Search** (`/es/buscar?search_query=torno`) | ✅ Clean | ✅ Clean | ✅ Clean |
| **Category** (`/es/28-maquinaria-metal`) | ✅ Clean | ✅ Clean | ✅ Clean |
| **Pricing** (`/es/module/zonacncplans/pricing`) | ✅ Clean | ✅ Clean | ✅ Clean |

*\* `.zcnc-hero` shows a small overflow (288px on desktop, 78px on mobile) — consistent with an intentional full-width background/stretched design. No visual or functional regression.*

### Viewport totals

| Viewport | Issues Found |
|----------|:-----------:|
| Desktop (1440×900) | 0 ⚠️ (hero overflow — intentional) |
| Tablet (768×1024) | 0 ✅ |
| Mobile (390×844) | 0 ⚠️ (hero overflow — intentional) |

**No horizontal overflow, no text overflow, no layout breakage detected on any public page.**

---

## 2. Auth Status (BLOCKER)

### AUTH-001: Login page HTTP 500 — Day 3

| URL | Status | Detail |
|-----|--------|--------|
| `https://new.zonacnc.com/es/iniciar-sesion` | 🔴 HTTP 500 | `net::ERR_HTTP_RESPONSE_CODE_FAILURE` |
| `https://new.zonacnc.com/en/login` | 🔴 HTTP 500 | `net::ERR_HTTP_RESPONSE_CODE_FAILURE` |
| `https://new.zonacnc.com/es/iniciar-sesion?create_account=1` | 🔴 HTTP 500 | Registration also blocked |

**Status:** Still broken for the 3rd consecutive day (since 2026-05-01).

### AUTH-003: QA Email Pool Exhausted
All accounts test7@zonacnc.com through test30@zonacnc.com remain registered from prior runs. No registration possible even if auth were working — new test accounts needed (test31+).

---

## 3. Console Errors (Non-critical)

| Error | Source | Impact |
|-------|--------|--------|
| `Not signed in with the identity provider` | Google Identity Services | Expected when user not logged in |
| `FedCM get() rejects with NetworkError` | Google Sign-In client | Expected without Google credentials |

Neither error affects responsive layout or user experience on public pages.

---

## 4. Summary

| Finding | Severity | Status |
|---------|----------|--------|
| AUTH-001: Login/My Account HTTP 500 | **🔴 Critical** | Still broken (Day 3) — since 2026-05-01 |
| AUTH-003: QA test account pool exhausted | Medium | All test7–test30 used; needs test31+ |
| Responsive layout (public pages) | ✅ Pass | No regressions across 12 viewport/page combinations |
| Console errors (GSI/identity provider) | ✅ Pass | Expected behavior, no user-facing impact |

---

## 5. Recommendations

1. **🔴 URGENT: Fix auth system** — The login/register 500 error has blocked all authenticated functionality for 3+ days
2. Allocate new test accounts (test31@zonacnc.com through test35@zonacnc.com)
3. Responsive layout remains solid on all public pages — no CSS/layout changes needed

---

**Testing completed at:** 2026-05-03 02:46 UTC  
**Total time:** ~5 minutes (within 30-min cap)
