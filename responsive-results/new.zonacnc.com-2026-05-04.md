# Responsive Test Report: new.zonacnc.com

**Date:** 2026-05-04 16:42 UTC  
**URL:** https://new.zonacnc.com  
**Tool:** Remote MCP browser (pwmcp-zonacnc)  
**Viewports tested:** Desktop (1280×720), Tablet (768×1024), Mobile (375×667)  
**Pages tested:** Home (`/es/`), Search (`/es/buscar`), Product detail (`/es/tornos/13005-...`), Login (`/es/iniciar-sesion`), Ads (`/es/module/zonacncproductadd/ads`)

---

## Summary

| Viewport | Grade | Critical Issues |
|----------|-------|-----------------|
| Desktop (1280×720) | 🟢 Pass | None |
| Tablet (768×1024) | 🟡 Warning | Nav text labels hidden, reduced discoverability |
| Mobile (375×667) | 🔴 Fail | No hamburger menu, key nav links hidden, contact hidden, language selector hidden, icon-only links lack text |

---

## Common Issues (All Viewports)

| ID | Severity | Description | Evidence |
|----|----------|-------------|----------|
| C-01 | ⚠️ Low | `Not signed in with the identity provider` error on every page | Console error from Google Identity Services |
| C-02 | ⚠️ Low | `FedCM get() rejects with NetworkError` on every page | Console error from GSI client |
| C-03 | ⚠️ Low | `Unexpected token '&'` JavaScript syntax error | Console error on all pages tested |

These are non-critical for responsive layout but indicate configuration issues with Google One Tap / Identity integration.

---

## Desktop (1280×720) — ✅ Pass

All elements render correctly:

| Element | Status | Notes |
|---------|--------|-------|
| Navigation bar | ✅ | Full text+icon: Categorías, Vendedores, Tarifas, Iniciar sesión |
| Contact link | ✅ | "Contacte con nosotros" visible |
| Language selector | ✅ | All 10 languages available |
| "Vender máquina" button | ✅ | Text+icon visible |
| Logo | ✅ | zonacnc.com logo visible |
| Footer | ✅ | All sections visible |

---

## Tablet (768×1024) — ⚠️ Warning

Navigation degrades to icon-only for several items:

| Element | Status | Notes |
|---------|--------|-------|
| "Categorías" | ❌ | Only icon + dropdown arrow, no text label |
| "Vendedores" | ❌ | Only icon, no text |
| "Tarifas" | ❌ | Only icon, no text |
| "Iniciar sesión" | ✅ | Text "Iniciar sesión" preserved |
| "Vender máquina" | ❌ | Only icon, no text |
| Contact link | ✅ | Visible |
| Language selector | ✅ | Visible |

**Impact:** Users cannot read nav labels. Items are identifiable only by icon, reducing discoverability and accessibility.

**Recommendation:** Add text labels back for tablet breakpoint, or provide a tooltip/aria-label on icon-only links.

---

## Mobile (375×667) — 🔴 Fail

Major navigation and functionality loss:

### 🔴 Critical Issues

| ID | Severity | Description | Evidence |
|----|----------|-------------|----------|
| M-01 | 🔴 Critical | **No hamburger menu** — Category navigation ("Categorías") is lost behind icon+dropdown on tablet, and on mobile only shows an icon+dropdown arrow. No expandable hamburger/collapsible menu exists. Users cannot browse categories on mobile. | Snapshot ref: e11 shows only icon link with dropdown arrow |
| M-02 | 🔴 Critical | **"Vendedores" hidden** — Main nav item "Vendedores" disappears entirely on mobile. | Not present in mobile header snapshot |
| M-03 | 🔴 Critical | **"Tarifas" hidden** — Main nav item "Tarifas" disappears entirely on mobile. | Not present in mobile header snapshot |
| M-04 | 🔴 Critical | **"Contacte con nosotros" hidden** — Contact link disappears on mobile. | Not present in mobile header; present on desktop |
| M-05 | 🔴 Critical | **Language selector hidden** — Combobox with 10 languages disappears on mobile. Users cannot switch languages. | Options exist in DOM (`box=0,0,0,0`) but have no visible rendering |

### 🟡 Warning Issues

| ID | Severity | Description | Evidence |
|----|----------|-------------|----------|
| M-06 | 🟡 High | **"Iniciar sesión" icon-only** — Login link has no text label on mobile. Only an icon (ref=e22/e23). Users may not know it's the login button. | Snapshot: link with img only, no visible text |
| M-07 | 🟡 High | **"Vender máquina" icon-only** — "Publicar anuncio" link has no text label on mobile. Only an icon (ref=e24/e25). | Snapshot: link with img only, no visible text |
| M-08 | 🟡 Medium | **"Categorías" icon-only** — Shows dropdown arrow but no text label "Categorías". | Snapshot: icon + dropdown arrow, no readable text |

### ✅ Passing Elements (Mobile)

| Element | Status | Notes |
|---------|--------|-------|
| Search toggle button | ✅ | "Mostrar barra de búsqueda" button present and functional |
| Product cards | ✅ | Stack vertically, readable, "Enviar solicitud" buttons visible |
| Product detail page | ✅ | All sections render: price, specs, description, seller info, contact form |
| Login page | ✅ | Form fields (email, password, show/hide toggle) all visible |
| Registration page | ✅ | Accessible via "Cree su cuenta" link |
| "Vender máquina" page | ✅ | Form loads correctly with all fields (category, brand, model, etc.) |
| Breadcrumb navigation | ✅ | Present on all pages |
| Footer accordion | ✅ | Collapsible sections with "Mostrar/ocultar" buttons |
| Cookie consent dialog | ✅ | Visible and dismissable |
| Pagination | ✅ | Visible on search results |
| Filter button ("Filtros") | ✅ | Present on search page |
| Chat help button | ✅ | Floating chat button visible bottom-right |

---

## Page-Specific Results

### Homepage (`/es/`)
- Desktop: ✅ All sections render
- Tablet: ⚠️ Nav labels hidden, content OK
- Mobile: 🔴 Critical nav loss (M-01 through M-08)

### Search (`/es/buscar`)
- Mobile: ✅ Filters accessible, cards stack, breadcrumbs visible, pagination works
- Note: Redirected to search page properly

### Product Detail (`/es/tornos/13005-torno-cnc-haas-st-10y-2021-qa-a11y-email-test.html`)
- Mobile: ✅ Page loads (HTTP 200, no 500 error observed during this test)
- ✅ Price "35.500,00 €" visible
- ✅ Specs table (Fabricante, Modelo, Año, Estado, Ubicación) all readable
- ✅ Description section renders
- ✅ Seller info ("Vendedor ocasional" - QA Test SL) visible
- ✅ Contact form ("Enviar solicitud") with all fields
- ✅ Related products section ("4 productos más en la misma categoría")
- Note: Main product image shows "Imagen no disponible" (test listing expected)

### Login (`/es/iniciar-sesion`)
- Mobile: ✅ All form fields visible and properly sized
- ✅ Email field, Password field, Show password toggle
- ✅ "¿Olvidó su contraseña?" link, "Iniciar sesión" button
- ✅ "Continuar con Google" social login
- ✅ "Cree su cuenta" registration link

### Ads/Create Listing (`/es/module/zonacncproductadd/ads`)
- Mobile: ✅ Full form renders with all fields:
  - Categoría combobox (extensive hierarchy)
  - Fabricante combobox (searchable, 200+ brands)
  - Modelo textbox
  - Título del anuncio textbox
  - Estado radiogroup (Usada - Funcional / Necesita reparación / Repuestos)
  - Precio spinbutton + Tipo de precio combobox
  - Año de fabricación, Horas de uso
  - Ciudad, Provincia, País comboboxes
- ✅ "Publica tu anuncio GRATIS" heading visible
- ✅ Step indicators (1, 2, 3) visible

---

## Comparison with Previous Report (2026-05-04 prior)

| Issue | Previously | Current | Change |
|-------|-----------|---------|--------|
| No hamburger menu on mobile | ❌ Fail | ❌ Fail | No change |
| Contact bar missing on mobile | ❌ Fail | ❌ Fail | No change |
| Login link lacks text on mobile | ❌ Fail | ❌ Fail | No change |
| Product page 500 error | Not tested | ✅ Pass (200) | N/A |
| Console errors (Google ID, '&' token) | Not reported | ⚠️ Present | New finding |
| Nav text labels hidden on tablet | Not reported | ❌ Fail | New finding |
| Language selector hidden on mobile | Not reported | ❌ Fail | New finding |

---

## Recommendations

### Critical (Mobile)
1. **Implement hamburger/mobile navigation menu** — Replace hidden nav items with a collapsible hamburger menu containing all desktop nav links (Categorías, Vendedores, Tarifas, Contacto).
2. **Restore "Contacte con nosotros" link** — Add contact link to mobile header or hamburger menu.
3. **Restore language selector** — Show language dropdown or flag icon on mobile header.
4. **Add text labels to icon-only links** — "Iniciar sesión" and "Vender máquina" buttons need visible text, not just icons.

### Warning (Tablet)
5. **Restore nav text labels** — At 768px width there is enough space for text labels alongside icons. Add them back.

### Low Priority
6. **Fix Google Identity Services integration** — Resolve the `Not signed in with the identity provider` error.
7. **Fix JavaScript syntax error** — `Unexpected token '&'` suggests a malformed URL or JSON parsing issue.

---

**Test completed by:** OpenClaw QA Agent (tester)  
**Job ID:** cron:53983183-66c6-4b72-9b21-404aac116c60
