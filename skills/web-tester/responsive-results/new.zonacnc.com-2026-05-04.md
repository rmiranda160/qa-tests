# Responsive Test Report — new.zonacnc.com
**Date:** 2026-05-04 | **Tool:** MCP Browser (pwmcp-zonacnc)  
**Viewports tested:** Desktop (1920×1080), Tablet (768×1024), Mobile (375×667)  
**Scope:** Homepage, Search/Buscar, Login, Registration

---

## Summary of Findings

### ✅ Pass: Good Responsive Behavior
| Feature | Status | Notes |
|---|---|---|
| Search dialog toggle on mobile | ✅ | "Mostrar barra de búsqueda" button opens overlay search dialog |
| Filter toggle on mobile search page | ✅ | "Filtros" button appears replacing sidebar filters |
| Footer accordion on mobile | ✅ | Sections collapse with "Mostrar/ocultar" toggle buttons |
| Breadcrumb navigation | ✅ | Visible and functional at all viewports |
| Language selector | ✅ | Present across all viewports |
| Cookie consent dialog | ✅ | Properly renders at all sizes |
| Test mode banner | ✅ | Present and visible at all sizes |
| Machine listing cards | ✅ | Stack vertically on small screens, good readability |
| Back-to-top link | ✅ | Present at all viewports |
| Chat help button | ✅ | Present at all viewports |

### ❌ Issues Found

#### 1. Main navigation missing on mobile (No hamburger menu)
- **Severity:** Medium
- On desktop, the nav has "Categorías" as a text link with dropdown icon.
- On mobile (375px), the "Categorías" link and all text labels in the header are hidden. Only icons remain.
- **There is no hamburger menu** to access the main navigation. Users on mobile have no way to browse categories from the header.
- **Recommendation:** Add a hamburger/toggle menu on screens < 768px that reveals the full navigation.

#### 2. Top bar (Contact) hidden on mobile
- **Severity:** Low
- The top bar with "Contacte con nosotros" is present on desktop and tablet but completely hidden on mobile.
- **Recommendation:** Show contact link as an icon in the mobile header or include it in the hamburger menu.

#### 3. Login link has no text on mobile
- **Severity:** Low
- "Iniciar sesión" shows as icon+text on desktop/tablet but only icon on mobile.
- While common practice, a tooltip or aria-label should be verified for accessibility.
- **Recommendation:** Consider keeping the text or ensuring clear aria-labels.

#### 4. Console errors on every page
- **Severity:** Medium
- `Provider's accounts list is empty`
- `Unexpected token '&'`
- `Not signed in with the identity provider` (on search page)
- These occur at all viewports and indicate potential JS/runtime issues.

#### 5. Product detail pages return HTTP 500/error
- **Severity:** High
- Navigating to product detail pages (e.g., `/tornos/12976-torno-cnc-qa-test-i18n-2000.html`) results in `ERR_HTTP_RESPONSE_CODE_FAILURE` (likely 500 error).
- The server-side rendering appears broken for product detail pages.
- This affects all viewports, including mobile, preventing users from viewing machine details.
- **Recommendation:** Check server logs for product detail page rendering failures.

---

## Viewport Comparison Table

| Element | Desktop (1920px) | Tablet (768px) | Mobile (375px) |
|---|---|---|---|
| Header top bar | ✅ Full visible | ✅ Visible | ❌ Hidden |
| "Categorías" nav link | ✅ Text + dropdown | ❌ Hidden (icon only) | ❌ Hidden |
| Search bar | ✅ Visible + combobox | ❌ Icon only | ❌ Icon + toggle button |
| "Iniciar sesión" | ✅ Icon + text | ✅ Icon + text | ❌ Icon only |
| "Vender máquina" | ✅ Text + icon | ✅ Image link | ✅ Image link |
| Hamburger menu | ❌ N/A | ❌ N/A | ❌ Missing |
| Categories section | ✅ Grid | ✅ Stacked | ✅ Stacked |
| Machine listings | ✅ Grid | ✅ Stacked | ✅ Stacked |
| Footer sections | ✅ Expanded | ✅ Expanded | ✅ Accordion |
| Cookie banner | ✅ Overlay | ✅ Overlay | ✅ Overlay |
| Test mode banner | ✅ Visible | ✅ Visible | ✅ Visible |
| Product detail page | ❌ HTTP Error | ❌ HTTP Error | ❌ HTTP Error |

---

## Recommendations (Priority Order)
1. **HIGH** — Fix product detail page HTTP errors (critical for user journey)
2. **HIGH** — Add hamburger/mobile navigation menu for screens < 768px
3. **MEDIUM** — Investigate and fix console errors (provider accounts, token parsing)
4. **LOW** — Show contact link on mobile (icon at minimum)
5. **LOW** — Consider keeping "Iniciar sesión" text on mobile for clarity
