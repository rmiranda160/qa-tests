# Responsive Test Report — new.zonacnc.com

**Date:** 2026-05-02  
**Tester:** MCP Remote Browser (pwmcp-zonacnc)  
**User:** test25@zonacnc.com  
**Scope:** Homepage ESPAÑA — mobile, tablet, desktop  
**Scenario:** CRON_QA responsive testing

---

## Summary

| Metric | Result |
|--------|--------|
| Pages tested | 6 (Home, Search, Category, PDP, My Account, Pricing) |
| Viewports tested | 3 (390×844, 768×1024, 1280×800) |
| Overflow issues | **0** — all pages clean across all viewports |
| HTTP errors | **1** — Login page returns 500 |
| Console errors | None (blocking) — only non-blocking "Provider's accounts list is empty" |
| Registration | ✅ test25@zonacnc.com registered & logged in successfully |
| Cart/Favorites | Functional (buttons present, no errors) |

---

## Test Matrix

### Mobile (390×844)

| Page | URL | Overflow | Screenshot |
|------|-----|----------|------------|
| Home | `/es/` | ✅ Clean | `responsive-home-mobile-390x844.png` (from earlier session) |
| Search | `/es/buscar?search_query=torno` | ✅ Clean | (from earlier session) |
| Category | `/es/15-tornos` | ✅ Clean | (from earlier session) |
| PDP | `/es/carretillas-elevadoras-para-taller/12919-abus-vh656.html` | ✅ Clean | `responsive-pdp-mobile-390x844.png` |
| My Account | `/es/mi-cuenta` | ✅ Clean | `responsive-myaccount-mobile-390x844.png` |
| Pricing | `/es/pricing` | ✅ Clean | `responsive-pricing-mobile-390x844.png` |

### Tablet (768×1024)

| Page | URL | Overflow | Screenshot |
|------|-----|----------|------------|
| Home | `/es/` | ✅ Clean | `responsive-home-tablet-768x1024.png` |
| Search | `/es/buscar` | ✅ Clean | `responsive-search-tablet-768x1024.png` |
| Category | `/es/15-tornos` | ✅ Clean | `responsive-category-tablet-768x1024.png` |
| PDP | `/es/carretillas-elevadoras-para-taller/12919-abus-vh656.html` | ✅ Clean | `responsive-pdp-tablet-768x1024.png` |
| My Account | `/es/mi-cuenta` | ✅ Clean | `responsive-myaccount-tablet-768x1024.png` |
| Pricing | `/es/pricing` | ✅ Clean | `responsive-pricing-tablet-768x1024.png` |

### Desktop (1280×800)

| Page | URL | Overflow | Screenshot |
|------|-----|----------|------------|
| Home | `/es/` | ✅ Clean | `responsive-home-desktop-1280x800.png` |
| Search | `/es/buscar` | ✅ Clean | `responsive-search-desktop-1280x800.png` |
| Category | `/es/15-tornos` | ✅ Clean | (from earlier session) |
| PDP | `/es/carretillas-elevadoras-para-taller/12919-abus-vh656.html` | ✅ Clean | `responsive-pdp-desktop-1280x800.png` |
| My Account | `/es/mi-cuenta` | ✅ Clean | (from earlier session) |
| Pricing | `/es/pricing` | ✅ Clean | `responsive-pricing-desktop-1280x800.png` |

---

## Bugs Found

### BUG-001: Login page returns HTTP 500
- **URL:** `https://new.zonacnc.com/es/iniciar-sesion`
- **Severity:** **Critical** — blocks all login/authentication via normal flow
- **Impact:** Users cannot log in through the standard login page. Registration works via direct `/es/?controller=registration` controller URL.
- **Workaround:** Registration can be completed via the controller URL directly, but login remains broken.

### BUG-002: Console warning — "Provider's accounts list is empty"
- **Severity:** Low (non-blocking)
- **Impact:** No visible UI effect. Likely a PrestaShop module initialization issue.

---

## Responsiveness Observations

### Header / Navigation
- **Mobile (390px):** Hamburger menu replaces full nav. Search icon visible. Top bar (contact, language, user) likely hidden.
- **Tablet (768px):** Top bar fully visible with contact, sellers, pricing links, language selector, and user account dropdown. Full search bar visible. Categories link visible.
- **Desktop (1280px):** Full horizontal navigation with all elements visible.

### Footer
- All viewports: Footer renders with full multi-column layout (Marketplace, Legal, Nuestra empresa, Su cuenta, Store info, Featured categories, Top brands).
- No collapsed/accordion sections observed on any viewport — the full list of links is always shown. On mobile viewport, this may result in a very long footer with 50+ links. Consider implementing collapsible sections for mobile.

### Product Cards
- **Mobile:** Cards are single-column, stacking vertically. Images, price, brand, and year all visible. No truncation issues.
- **Tablet:** 2-column grid. Cards remain proportional.
- **Desktop:** Multiple columns in grid layout. No overflow.

### Search Page
- **Mobile:** Full-width single column. Filter sidebar likely hidden or togglable.
- **Tablet/Desktop:** Left sidebar with category filters visible.

### Pricing Page
- **Mobile:** Plan cards stack vertically. Clean layout.
- **Tablet/Desktop:** Side-by-side plan comparison cards.

---

## Recommendations

1. **Fix login page (BUG-001):** `/es/iniciar-sesion` returns 500 — investigate the controller for errors. This is the most critical issue found.
2. **Consider collapsible footer sections on mobile:** The footer has 50+ links across 7 sections — accordion/collapse behavior would improve mobile UX.
3. **No overflow issues found** — responsive layout appears well-implemented across all tested viewports. Good job.
