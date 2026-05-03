# Responsive Test Results — new.zonacnc.com

**Date:** 2026-05-02 23:58 UTC  
**Tester:** MCP Remote Browser (pwmcp-zonacnc)  
**User:** Anonymous (QA email pool test7–test30 exhausted)  
**Scope:** Homepage ESPAÑA — mobile, tablet, desktop  
**Scenario:** CRON_QA responsive testing

---

## Summary

| Metric | Result |
|--------|--------|
| Pages tested | 6 (Home, Search, Category, Pricing, Vendors, Registration) |
| Viewports tested | 3 (390×844, 768×1024, 1280×800) |
| Element overflow issues | **1 persistent** — `.zcnc-hero` on all viewports |
| Text overflow | No new issues |
| HTTP 500 error | **1** — Login page `/es/iniciar-sesion` still returns 500 |
| QA email pool | **Exhausted** — all test7–test30 registered |
| Critical responsive breakage | **None** |

---

## Test Matrix

### Mobile (390×844)

| Page | URL | Overflow | Notes |
|------|-----|----------|-------|
| Home | `/es/` | ⚠️ `.zcnc-hero` scrollWidth 468 > 390 (diff 78px, hidden) | Background decorative content clipped |
| Search | `/es/buscar?search_query=torno` | ✅ Clean | |
| Category | `/es/15-tornos` | ✅ Clean | |
| Pricing | `/es/pricing` | ✅ Clean | Clean mobile layout |
| Vendors | `/es/vendedores` | ✅ Clean | |
| Registration | `/es/?controller=registration` | ✅ Clean | Form accessible |

### Tablet (768×1024)

| Page | URL | Overflow | Notes |
|------|-----|----------|-------|
| Home | `/es/` | ⚠️ `.zcnc-hero` scrollWidth 922 > 768 (diff 154px) | |
| Search | `/es/buscar` | ✅ Clean | |
| Category | `/es/15-tornos` | ✅ Clean | |
| Pricing | `/es/pricing` | ✅ Clean | |
| Vendors | `/es/vendedores` | ✅ Clean | |
| Registration | `/es/?controller=registration` | ✅ Clean | |

### Desktop (1280×800)

| Page | URL | Overflow | Notes |
|------|-----|----------|-------|
| Home | `/es/` | ⚠️ `.zcnc-hero` scrollWidth 1536 > 1280 (diff 256px) + `.zonacnc-cta-inner` 1220 > 1200 (diff 20px) | |
| Search | `/es/buscar` | ✅ Clean | |
| Category | `/es/15-tornos` | ✅ Clean | |
| Pricing | `/es/pricing` | ✅ Clean | |
| Vendors | `/es/vendedores` | ✅ Clean | |
| Registration | `/es/?controller=registration` | ✅ Clean | |

---

## Key Findings

### CRITICAL: Login page HTTP 500 persists
- `/es/iniciar-sesion` returns `net::ERR_HTTP_RESPONSE_CODE_FAILURE`
- Blocks all authenticated testing
- Unchanged from previous reports

### QA email pool exhausted
- test7@zonacnc.com through test30@zonacnc.com — all already registered
- Cannot create new accounts for authenticated testing
- Previous workaround (test33) is outside the `.env.qa.email` range

### Minor: `.zcnc-hero` overflow (all viewports)
- Background decorative content is clipped
- Visible/functional content remains unaffected

## Conclusion

Responsive layout is **solid** across all tested pages. The main blockers are the login 500 error (prevents authenticated testing) and the exhausted QA email pool (prevents fresh account creation). Minor CSS overflow in `.zcnc-hero` persists as a visual-only issue.
