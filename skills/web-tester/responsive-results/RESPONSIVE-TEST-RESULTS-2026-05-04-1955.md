# Responsive Design Test Report — new.zonacnc.com
**Date:** 2026-05-04 19:49–19:57 UTC  
**CRON Job:** tester-responsive (focus_area=responsive)  
**Scope:** new.zonacnc.com (strict)  
**Method:** MCP browser automation (pwmcp-zonacnc) + DOM evaluation

---

## Test Configuration

| Viewport | Dimensions | Device Class |
|----------|-----------|--------------|
| Desktop  | 1440×900  | Laptop/Desktop |
| Tablet   | 768×1024  | iPad portrait |
| Mobile   | 390×844   | iPhone 14/15 Pro |

## Pages Tested

1. **Homepage** — `/es/` (redirects from `/`)
2. **Search / Listing** — `/es/buscar`
3. **Product Detail** — `/es/centros-de-mecanizado-multifuncion/12934-gildemeister-ctx-510.html`
4. **Login** — `/es/iniciar-sesion?back=...`
5. **Publish** — `/es/publicar` (redirects to login for unauthenticated users)

---

## RESPONSIVE FINDINGS SUMMARY

### ✅ GREEN / FIXED (vs prior reports)

| Issue | Status | Detail |
|-------|--------|--------|
| **Header login text on mobile** | ✅ FIXED | "Iniciar sesión" now shows text + icon on mobile (was icon-only before) |
| **Categories link on mobile** | ✅ FIXED | "Categorías" link visible at 390px with `display: flex` |
| **Contact link on mobile** | ✅ FIXED | "Contacte con nosotros" visible at all viewports |
| **Hamburger/mobile menu** | ✅ PRESENT | `menu-toggle` button with `aria-label="Abrir menú móvil"`, opens Bootstrap offcanvas `#mobileMenu` |
| **Search offcanvas** | ✅ PRESENT | Search toggle button opens `#searchCanvas` offcanvas on mobile |
| **Footer accordion** | ✅ PRESENT | 5 footer sections collapse on mobile with `d-md-none collapsed` buttons |
| **No horizontal overflow** | ✅ Homepage, Search, Login | All key pages have `bodyWidth === viewportWidth` |
| **Breadcrumbs** | ✅ PRESENT | Visible on search and product pages at all breakpoints |
| **Language switcher** | ✅ PRESENT | Mobile nav includes language + currency selectors |
| **Filter toggle** | ✅ PRESENT | Search page has visible filter panel with toggle on mobile |

### 🟡 WARNINGS

| Issue | Severity | Detail |
|-------|----------|--------|
| **Product page horizontal overflow** | ⚠️ MEDIUM | `MAIN.wrapper` has `scrollWidth: 511px` vs `viewport: 390px`. 5+ `img-fluid` images have explicit `width: 1440px`. Main content container overflows on mobile. |
| **Spec table no overflow wrapper** | ⚠️ LOW | `table.zcnc-data-section` has no `overflow-x: scroll/auto` parent. At some viewports, tabular data may overflow. |
| **Product price outer wrapper hidden** | ⚠️ LOW | `.product__prices.js-product-prices` has `display: none` but inner `.zcnc-price-bar` is visible. Inconsistent display logic. |
| **17 thumbnails in gallery** | ⚠️ LOW | Product image gallery has 17 thumbnails — may cause dense layout on mobile. |
| **Publish page loads but redirects** | ℹ️ INFO | `/es/publicar` loads then redirects to login for unauthenticated users. Expected behavior, but confirm redirect UX is smooth on mobile. |

### 🔴 CONSOLE ERRORS (cross-page)

| Error | Frequency | Source |
|-------|-----------|--------|
| `Not signed in with the identity provider` | Every page | Google Identity Services (`accounts.google.com/gsi/client`) |
| `FedCM get() rejects with NetworkError` | Every page | FedCM token retrieval failure |
| `Unexpected token '&'` | Every page | Likely malformed JSON response or HTML entity in JS context |

These Google Identity Services errors appear on all pages and all viewports. They are not responsive-specific but degrade the user experience universally.

---

## BREAKPOINT-SPECIFIC ANALYSIS

### Mobile (390×844)

| Check | Result |
|-------|--------|
| Hamburger menu toggle | ✅ Button visible, `data-bs-toggle="offcanvas" data-bs-target="#mobileMenu"` |
| Desktop nav hidden | ✅ `.ps-mainmenu__desktop` has `d-none d-xl-block` (hidden < 1200px) |
| Login link | ✅ `display: inline-flex`, text "Iniciar sesión" visible |
| Categories link | ✅ `display: flex` |
| Contact link | ✅ `display: inline` |
| Search input | ✅ Hidden, replaced by search toggle → offcanvas |
| Cookie banner | ✅ Visible |
| Footer accordion | ✅ 5 `d-md-none collapsed` toggle buttons |
| Horizontal overflow (homepage) | ✅ None |
| Horizontal overflow (product) | ⚠️ Present (511px) |
| Title font size (product) | ✅ 28px |
| Filter headings | ✅ 14-18px |
| Price display | ⚠️ Price bar visible, outer wrapper hidden |
| Breadcrumb | ✅ Visible |

### Tablet (768×1024)

All pages render correctly. No horizontal overflow detected. The `d-md-none` classes mean footer accordions are collapsed, `d-xl-block` means desktop nav is still hidden at tablet width. Layout transitions correctly between mobile and desktop breakpoints.

### Desktop (1440×900)

All pages render correctly at full width. Full desktop navigation visible. No responsive issues.

---

## EMAIL CHECK

- **test7@zonacnc.com**: 10 emails today. Latest: "[zonacnc.com] Su nueva contraseña" (password reset, 17:05 CEST) — template in Spanish. Triggered by prior testing, not this run.
- **test14@zonacnc.com**: Authentication failed (password likely changed). Other test accounts not checked — no ad creation occurred in this run.

---

## COMPARISON WITH PREVIOUS REPORTS

Prior reports (April 30 – May 3) identified:
- ❌ Header links hidden on mobile → **FIXED** (login, categories, contact all visible now)
- ❌ Search input missing on mobile → **FIXED** (offcanvas search implemented)
- ❌ No hamburger menu → **FIXED** (Bootstrap offcanvas menu present)
- ❌ Footer not collapsible → **FIXED** (accordion with d-md-none toggles)

### Remaining Issues
1. **Product page horizontal overflow** — `MAIN.wrapper` scrollWidth exceeds viewport (regression or pre-existing)
2. **Google Identity Services errors** — persistent FedCM/GIS console errors on all pages
3. **`Unexpected token '&'`** — JS parsing error, needs investigation

---

## RECOMMENDATIONS

1. **Fix product page overflow**: Add `overflow-x: hidden` or responsive wrapper to MAIN.wrapper, or fix the 1440px-width images
2. **Investigate GIS/FedCM errors**: These may block Google Sign-In functionality
3. **Fix `Unexpected token '&'`**: Check for unescaped `&` in inline JavaScript or JSON responses
4. **Add `overflow-x: auto` to spec table wrapper**: Ensure table data is scrollable on mobile
5. **Consider thumbnail limit**: Gallery with 17 thumbnails could use a carousel or "show more" on mobile

---

*Report generated by CRON QA job `tester-responsive` — 2026-05-04 19:57 UTC*
