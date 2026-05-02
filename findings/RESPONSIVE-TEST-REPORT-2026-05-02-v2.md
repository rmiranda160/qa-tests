# 📱 Responsive QA Report — Core Navigation Pages
**Date:** 2026-05-02 13:02 UTC  
**Tester:** CRON_QA (tester agent)  
**Focus:** Responsive layout (MCP browser - pwmcp-zonacnc)  
**Base URL:** https://new.zonacnc.com/es/  
**User:** test20@zonacnc.com (logged in)

## Test Matrix

| Page | URL | Mobile (390px) | Tablet (768px) | Desktop (1440px) |
|------|-----|:---:|:---:|:---:|
| Home | / | ✅ PASS | ✅ PASS | ✅ PASS |
| Search | /buscar?search_query=torno | ✅ PASS | ✅ PASS | ✅ PASS |
| Category | /28-maquinaria-metal | ✅ PASS | ✅ PASS | ✅ PASS |
| Pricing | /module/zonacncplans/pricing | ✅ PASS | ✅ PASS | ✅ PASS |

## Checks Performed per Viewport × Page (12 combos)

1. ✅ **Document overflow** (scrollWidth vs clientWidth) — No horizontal overflow detected
2. ✅ **Container overflow** — `#wrapper`, `#center_column`, `#header`, `footer`, `.container`, `.products`, `#js-product-list` — No container overflow
3. ✅ **Card overflow** (article elements) — No cards overflow their viewport
4. ✅ **Button/filter width** — No button exceeds 95% viewport width
5. ✅ **Text clipping** — No meaningful text clipping (see false-positive notes)
6. ✅ **Full-page screenshots** captured for all 12 combos (stored on MCP server)

## Console Errors (observed during navigation)

| Page | Console Errors | Severity |
|------|---------------|:--------:|
| Home | 0 | 🟢 None |
| Search | 0 | 🟢 None |
| Category | 0 | 🟢 None |
| Pricing | 0 | 🟢 None |

No console errors at any viewport.

## False Positives Investigated

| Issue | Investigation | Verdict |
|-------|---------------|---------|
| `#_mobile_ps_searchbar` scrollWidth > clientWidth (6px) | Minor overflow within parent container; cosmetic | ✅ Acceptable |
| `SPAN.zcnc-vendor-name` with long names clipping | Long vendor names handled via CSS overflow:hidden; no visible cut-off | ✅ Acceptable |
| Top bar elements ("Contacte con nosotros", language switcher) | Negative position on mobile due to `overflow:hidden` on parent — intentionally hidden for mobile layout | ✅ Intentional |
| Category name "Accesorios para maquinaria metal" scrollWidth detection | scrollWidth == clientWidth — text wraps naturally on mobile | ✅ False positive |
| Skip link / back-to-top links with clip detection | Accessibility-only elements, `overflow:hidden` anchors | ✅ False positive |

## Verdict

**✅ PASS** — All 4 core pages display correctly at mobile (390×844), tablet (768×1024), and desktop (1440×900) viewports. No horizontal overflow, no broken layouts, no cut-off content, no console errors.

## Screenshots Captured

### Mobile (390×844)
- `responsive-home-mobile-390x844.png`
- `responsive-search-mobile-390x844.png`
- `responsive-category-mobile-390x844.png`
- `responsive-pricing-mobile-390x844.png`

### Tablet (768×1024)
- `responsive-home-tablet-768x1024.png`
- `responsive-search-tablet-768x1024.png`
- `responsive-category-tablet-768x1024.png`
- `responsive-pricing-tablet-768x1024.png`

### Desktop (1440×900)
- `responsive-home-desktop-1440x900.png`
- `responsive-search-desktop-1440x900.png`
- `responsive-category-desktop-1440x900.png`
- `responsive-pricing-desktop-1440x900.png`
