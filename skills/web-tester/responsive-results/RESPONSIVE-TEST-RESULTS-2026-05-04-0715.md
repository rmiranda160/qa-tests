# Responsive Test Report — new.zonacnc.com
**Date:** 2026-05-04 07:15 UTC | **Tool:** MCP Browser (pwmcp-zonacnc)  
**Viewports tested:** Desktop (1920×1080), Tablet (768×1024), Mobile (375×667)  
**Pages tested:** Home, Search/Buscar, Login, Registration, Contact, Product Detail  
**Email verified:** test7@zonacnc.com (4 emails today - templates OK)

---

## Summary of Findings

### ✅ Pass: Good Responsive Behavior
| Feature | Status | Notes |
|---|---|---|
| Search toggle on mobile | ✅ | "Mostrar barra de búsqueda" button works, opens overlay search |
| Filter toggle on mobile search | ✅ | "Filtros" button appears replacing sidebar filters |
| Footer accordion on mobile | ✅ | Sections collapse/expand with "Mostrar/ocultar" toggle buttons |
| Breadcrumb navigation | ✅ | Visible and functional at all viewports |
| Cookie consent dialog | ✅ | Properly renders at all sizes |
| Test mode banner | ✅ | Present and visible at all sizes |
| Machine listing cards | ✅ | Stack vertically on small screens, good readability |
| Back-to-top link | ✅ | Present at all viewports |
| Chat help button | ✅ | Present at all viewports |
| Pagination | ✅ | Functional at all viewports |
| Categories grid | ✅ | Responsive layout adapts correctly |
| Email templates (ES) | ✅ | Spanish translations correct, proper branding |

### ❌ Issues Found

#### 1. 🔴 HIGH — Product detail pages return HTTP error
- **Severity:** Critical
- All product detail page URLs return `ERR_HTTP_RESPONSE_CODE_FAILURE`
- Tested: `/centros-de-mecanizado-multifuncion/12934-gildemeister-ctx-510.html`
- The server-side rendering appears broken, preventing users from viewing machine details.
- **Recommendation:** Check server logs for product detail page rendering failures immediately.

#### 2. 🟡 HIGH — No hamburger/mobile navigation menu
- **Severity:** High
- At 375px mobile, there is NO hamburger menu icon
- Users on mobile cannot access "Categorías" or other navigation from the header
- The "Categorías" link already loses its text label at 768px tablet (icons only)
- **Recommendation:** Add hamburger/toggle menu on screens < 768px that reveals full navigation.

#### 3. 🟡 MEDIUM — Navigation text disappears too early (768px tablet)
- **Severity:** Medium
- At 768px, these labels disappear (icons only):
  - "Categorías" — no text label ❌
  - "Vendedores" — no text label ❌
  - "Tarifas" — no text label ❌
  - "Vender máquina" — no text label ❌
- Only "Iniciar sesión" and "Contacte con nosotros" keep text at 768px
- **Recommendation:** Keep text labels until at least 480px or use hamburger menu.

#### 4. 🟡 MEDIUM — Console errors on every page
- `Provider's accounts list is empty` (Google Identity Services)
- `FedCM get() rejects with NetworkError` (Google sign-in)
- `Unexpected token '&'` (JS parsing error)
- **Recommendation:** Investigate GSI configuration and fix JS parsing error.

#### 5. 🟡 LOW — Top bar hidden on mobile
- "Contacte con nosotros" link completely hidden at 375px
- **Recommendation:** Show as icon or include in hamburger menu.

#### 6. 🟡 LOW — Login link has no text on mobile
- "Iniciar sesión" shows icon+text on desktop/tablet but icon-only on mobile
- **Recommendation:** Keep text or ensure clear aria-labels.

#### 7. 🟡 LOW — Language selector broken on mobile
- At 375px, the language selector loses its `<combobox>` wrapper — appears as bare `<option>` elements
- This breaks the UX for changing language on mobile
- **Recommendation:** Keep proper combobox/select wrapper at all viewports.

---

## Viewport Comparison Table

| Element | Desktop (1920px) | Tablet (768px) | Mobile (375px) |
|---|---|---|---|
| Header top bar (Contact) | ✅ Full | ✅ Visible | ❌ Hidden |
| "Categorías" nav link | ✅ Text + icon | ❌ Icon only | ❌ Icon only |
| "Vendedores" link | ✅ Text + icon | ❌ Icon only | ❌ Hidden |
| "Tarifas" link | ✅ Text + icon | ❌ Icon only | ❌ Hidden |
| Search bar | ✅ Visible + combobox | ✅ Visible | ✅ Toggle button |
| "Iniciar sesión" | ✅ Icon + text | ✅ Icon + text | ❌ Icon only |
| "Vender máquina" | ✅ Text + icon | ❌ Icon only | ❌ Icon only |
| Language selector | ✅ Combobox | ✅ Combobox | ❌ Bare options |
| Hamburger menu | N/A | ❌ Missing | ❌ Missing |
| Categories section | ✅ Grid | ✅ Stacked | ✅ Stacked |
| Machine listings | ✅ Grid | ✅ Stacked | ✅ Stacked |
| Footer sections | ✅ Expanded | ✅ Expanded | ✅ Accordion |
| Cookie banner | ✅ Overlay | ✅ Overlay | ✅ Overlay |
| Test mode banner | ✅ Visible | ✅ Visible | ✅ Visible |
| Product detail page | ❌ HTTP Error | ❌ HTTP Error | ❌ HTTP Error |

---

## Email Verification (IMAP - test7@zonacnc.com)

**4 emails today (May 4):**
1. Password confirmation — "Confirmación de contraseña" (04:21)
2. Password confirmation — "Confirmación de contraseña" (04:22)
3. Password confirmation — "Confirmación de contraseña" (04:24)
4. Password updated — "Su nueva contraseña" (04:27)

**Template review:** Spanish translations correct. Email from `no-reply@mg.zonacnc-sales.es`, proper PrestaShop branding, clean template. ✅

---

## Recommendations (Priority Order)
1. **CRITICAL** — Fix product detail page HTTP errors (blocks entire user purchase journey)
2. **HIGH** — Add hamburger/mobile navigation menu for screens < 768px
3. **MEDIUM** — Keep text labels on nav items at 768px tablet breakpoint
4. **MEDIUM** — Fix console errors (GSI accounts, JS token parsing)
5. **LOW** — Show contact link on mobile (icon at minimum)
6. **LOW** — Fix language selector wrapper on mobile
7. **LOW** — Keep "Iniciar sesión" and "Vender máquina" text on mobile
