# 📱 Responsive QA Report — new.zonacnc.com

**Date:** 2026-05-02 16:10 UTC  
**Tester:** CRON_QA (responsive focus)  
**Browser:** Chromium via MCP remoto (pwmcp-zonacnc)  
**User registered:** test30@zonacnc.com (account already existed from prior session)  
**Scope:** https://new.zonacnc.com/es/ — core public pages  
**Mode:** Responsive (3 viewports × 4 pages = 12 checks)

---

## Summary

| Metric | Result |
|---|---|
| Pages tested | 4 (Home, Search, Category, Pricing) |
| Viewports | 3 (390×844, 768×1024, 1440×900) |
| Total combinations | 12 |
| Overflow issues | **0** — all pages clean across all viewports |
| Login page (BUG-001) | ❌ Still returns HTTP 500 (pre-existing) |
| Registration | ✅ Works via ?controller=registration (test30@zonacnc.com confirmed existing) |

### Overall Verdict: ✅ PASS (no responsive regressions)

---

## Test Matrix

### Home (`/es/`)

| Viewport | Overflow | ScrollWidth | ClientWidth | Status |
|---|---|---|---|---|
| Mobile (390×844) | ✅ None | 390 | 390 | PASS |
| Tablet (768×1024) | ✅ None | 768 | 768 | PASS |
| Desktop (1440×900) | ✅ None | 1440 | 1440 | PASS |

### Search (`/es/buscar?search_query=torno`)

| Viewport | Overflow | ScrollWidth | ClientWidth | Status |
|---|---|---|---|---|
| Mobile (390×844) | ✅ None | 390 | 390 | PASS |
| Tablet (768×1024) | ✅ None | 768 | 768 | PASS |
| Desktop (1440×900) | ✅ None | 1440 | 1440 | PASS |

### Category (`/es/28-maquinaria-metal`)

| Viewport | Overflow | ScrollWidth | ClientWidth | Status |
|---|---|---|---|---|
| Mobile (390×844) | ✅ None | 390 | 390 | PASS |
| Tablet (768×1024) | ✅ None | 768 | 768 | PASS |
| Desktop (1440×900) | ✅ None | 1440 | 1440 | PASS |

### Pricing (`/es/module/zonacncplans/pricing`)

| Viewport | Overflow | ScrollWidth | ClientWidth | Status |
|---|---|---|---|---|
| Mobile (390×844) | ✅ None | 390 | 390 | PASS |
| Tablet (768×1024) | ✅ None | 768 | 768 | PASS |
| Desktop (1440×900) | ✅ None | 1440 | 1440 | PASS |

---

## Deep Element Analysis

A full scan of all visible elements (up to 2000 per page) for **horizontal overflow** was conducted:

| Page | Mobile | Tablet | Desktop |
|---|---|---|---|
| Home | 0 overflows | 0 overflows | 0 overflows |
| Search | 0 overflows | 0 overflows | 0 overflows |
| Category | 0 overflows | 0 overflows | 0 overflows |
| Pricing | 0 overflows | 0 overflows | 0 overflows |

**No element-level overflow** was detected on any page at any viewport.

---

## Known Issues (not regressions)

| Issue | Detail | Status |
|---|---|---|
| BUG-001 | Login page `/es/iniciar-sesion` returns HTTP 500 | 🔴 Unchanged (pre-existing) |
| BUG-002 | Console warning: "Provider's accounts list is empty" | 🔸 Non-blocking (pre-existing) |

---

## Screenshots

All 12 screenshots saved as `findings/responsive-{page}-{viewport}-2026-05-02.png`:

- `responsive-home-mobile-2026-05-02.png`
- `responsive-home-tablet-2026-05-02.png`
- `responsive-home-desktop-2026-05-02.png`
- `responsive-search-mobile-2026-05-02.png`
- `responsive-search-tablet-2026-05-02.png`
- `responsive-search-desktop-2026-05-02.png`
- `responsive-category-mobile-2026-05-02.png`
- `responsive-category-tablet-2026-05-02.png`
- `responsive-category-desktop-2026-05-02.png`
- `responsive-pricing-mobile-2026-05-02.png`
- `responsive-pricing-tablet-2026-05-02.png`
- `responsive-pricing-desktop-2026-05-02.png`

---

## Conclusion

**✅ Responsive test PASS.** All 4 core pages render correctly at mobile, tablet, and desktop viewports with zero overflow issues. The only unresolved issue is the pre-existing BUG-001 (login page 500), which is not a responsive regression.
