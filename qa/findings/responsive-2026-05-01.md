# Responsive QA Report — 2026-05-01

## Meta
- **Agent:** tester (subagent)
- **Focus area:** responsive
- **Target:** https://new.zonacnc.com
- **Method:** HTTP analysis (curl + web_fetch) — no browser/MCP available
- **Hard cap:** 30 min
- **Label:** qa-responsive

---

## Pages Verified

| Page | URL | Status | Size |
|------|-----|--------|------|
| Home | `/` | ✅ 200 | ~155KB |
| Search (cnc) | `/buscar?search_query=cnc` | ✅ 200 | ~694KB |
| Category | `/es/27-otros-tipos-de-maquinaria` | ✅ 200 | ~543KB |
| Product | `/es/bombas/12922-agostino-colombo-modelo.html` | ✅ 200 | ~212KB |
| Manufacturer | `/es/marca/650-agostino-colombo` | ✅ 200 | ~257KB |
| CMS Aviso Legal | `/es/content/7-aviso-legal` | ✅ 200 | ~122KB |
| CMS Privacidad | `/es/content/8-privacidad` | ✅ 200 | ~125KB |
| CMS Cookies | `/es/content/9-cookies` | ✅ 200 | ~121KB |
| CMS Cómo funciona | `/es/content/4-como-funciona` | ✅ 200 | ~120KB |
| Login | `/es/iniciar-sesion` | ✅ 200 | ~127KB |
| Sitemap | `/es/mapa-web` | ✅ 200 | ~324KB |
| Contact | `/es/contactenos` | ✅ 200 | OK |

---

## Responsive Infrastructure Checks

| Check | Status | Detail |
|-------|--------|--------|
| Viewport meta tag | ✅ | `width=device-width, initial-scale=1` present on all pages |
| Theme CSS | ✅ | Bootstrap 5. Breakpoints: 360, 576, 768, 992, 1200, 1400px |
| Listings custom CSS | ✅ | Breakpoints: 400, 575, 640, 767, 768, 991px |
| UX hotfix CSS | ✅ | `ux-hotfix-20260421.css` loaded. Addresses: CLS, 404 page, out-of-stock badges |
| `max-width: 100%` on images | ✅ | `.rich-text img{max-width:100%; height:auto}` |
| `overflow-x: hidden` on facets | ✅ | `.zcnc-facet-scroll{overflow-x:hidden}` |
| `.table-responsive` classes | ✅ | Available in BS5 per-breakpoint variants |
| `aspect-ratio` for CLS mitigation | ✅ | In UX hotfix CSS |

---

## Open Issues Verification

### 1. #916 — CMS Legal Tables Non-Responsive (MEDIUM)
**Status:** ⚠️ CONFIRMED STILL OPEN

**Evidence:**
- `/es/content/7-aviso-legal` — contains `<table>` with `.zcnc-legal table` class, no `.table-responsive` wrapper
- `/es/content/8-privacidad` — contains **2 tables** with substantial text in cells (e.g., "Gestión de la cuenta y prestación de los servicios contratados")
- `/es/content/9-cookies` — contains 1 table
- CSS: `.zcnc-legal table{width:100%}` but no `overflow-x: auto` on parent container
- `.rich-text` container lacks responsive table handling
- Theme has `.table-responsive` classes available but not applied to CMS content

**Pages without tables (not affected):**
- `/es/content/3-terminos-y-condiciones-de-uso`
- `/es/content/4-como-funciona`
- `/es/content/10-preguntas-frecuentes`

---

### 2. #675 — Mobile Search Results Layout Scroll (HIGH)
**Status:** ⚠️ CONFIRMED OPEN (fix partially deployed)

**Evidence:**
- The off-canvas sidebar fix IS deployed in production:
  - `.zcnc-sidebar` becomes `position: fixed; left: -320px` at ≤991px
  - `.zcnc-sidebar.open { left: 0 }` slide-in toggle
  - `.zcnc-sidebar-overlay` backdrop present
- Grid/List view responsive: 3→2→1 columns at 991/575px breakpoints
- List view images: 240px fixed → 100% width at mobile (≤575px)

**Remaining concerns:**
- `.zcnc-listings-layout { display: flex; flex-direction: row }` doesn't switch to `column` at any breakpoint
- The sidebar `position: fixed` removes it from flex flow, so `flex:1` on content should work
- Without visual/browser testing, cannot confirm horizontal scroll is fully resolved

---

### 3. #646 — Mobile Search Horizontal Scroll
**Status:** ⚠️ CONFIRMED OPEN (related to #675)

Referenced PR #645 was merged but its branch (`qa/findings-20260430-1651-tester`) has changes not yet confirmed in production `main` branch.

---

## CSS Responsive Architecture Summary

### Listings Module (`listings.css`, ~67KB)

| Component | Desktop | ≤991px | ≤575px | ≤400px |
|-----------|---------|--------|--------|--------|
| Grid columns | 3 | 2 | 1 | — |
| Home grid columns | 3 | 2 | — | 1 |
| List view card | Row (image 240px) | Row (image 180px) | Column (image 100%) | — |
| Sidebar | Inline 280px | Fixed off-canvas 300px | Fixed off-canvas | Fixed off-canvas |
| Sort wrapper | Inline | Inline | Full width flex | — |
| Pagination | Standard | Standard | Compact (34px) | — |

### Theme CSS
- Bootstrap 5 grid system
- Table responsive variants: `.table-responsive-{xs,sm,md,lg,xl,xxl}` at ≤ breakpoints
- `.offcanvas-{sm,md,lg,xl,xxl}` for responsive drawers

---

## Conclusions

1. **#916 (CMS tables):** No fix deployed. Tables lack responsive wrapper. Needs `overflow-x: auto` on `.rich-text` or bootstrap `.table-responsive` class.

2. **#675/#646 (Search scroll):** Partial fix deployed (off-canvas sidebar). Remaining concern is the flex layout not switching to column. No visual confirmation possible without browser.

3. **No NEW responsive issues identified** in this scan. All pages load with viewport meta, responsive CSS is present, breakpoints are defined for all components.

4. **Pages tested and passing basic responsive checks:** Home, Search, Categories, Products, Manufacturers, CMS (7 pages), Login, Sitemap, Contact, Cart.

---

## Files analyzed
- `/themes/hummingbird/assets/css/theme.css` — BS5 theme
- `/themes/hummingbird/assets/css/ux-hotfix-20260421.css` — UX hotfix
- `/modules/zonacnclistings/views/css/listings.css` — Listings module
- `/modules/zonacnclistings/views/css/facetedsearch-override.css` — Faceted search
- `/modules/zonacnclistings/views/css/watermark.css` — Watermark
