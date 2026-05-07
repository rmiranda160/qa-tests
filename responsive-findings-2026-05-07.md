# Responsive Testing Report – new.zonacnc.com
**Date:** 2026-05-07 08:27-08:35 UTC  
**Scope:** new.zonacnc.com only  
**Breakpoints tested:** Desktop (1920×1080), Tablet (768×1024), Mobile (375×812)  
**Pages tested:** Homepage, Product Detail, Login, Search/Browse  
**Language:** Spanish (es)

---

## Summary
| Breakpoint | Homepage | Product Detail | Login | Search |
|---|---|---|---|---|
| Desktop (1920) | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| Tablet (768) | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| Mobile (375) | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |

**Overall verdict: PASS** – All critical pages render correctly across breakpoints. No layout breakages or overlapping elements found. 3 issues noted for remediation.

---

## Interactive Elements Tested (Mobile 375px)

| Element | Result | Notes |
|---|---|---|
| Hamburger menu | ✅ Working | Opens dialog with language selector + "Contacte con nosotros" link. Close button works. |
| Search toggle | ✅ Working | Opens offcanvas dialog with search combobox + "Cancelar" button. |
| Footer collapse toggles | ✅ Working | "Mostrar/ocultar" expands/collapses each footer section. Marketplace section shows 4 links (Cómo funciona, Planes para vendedores, Todos los vendedores, Preguntas frecuentes). |
| Cookie consent dialog | ✅ Working | Dismissible via "Aceptar y cerrar" button. |
| Product image gallery | ✅ Working | Thumbnail navigation, prev/next buttons, fullscreen gallery button all present. |
| Language selector | ✅ Working | 11 languages available as options (English, Català, Español, Galego, Euskera, Français, Deutsch, Português PT, Italiano, Türkçe, Русский). |
| Breadcrumbs | ✅ Visible | Present on all detail pages. |

---

## Issues Found

### Issue 1 (MEDIUM): Theme.js JavaScript Errors During Offcanvas Interactions
**Severity:** Medium  
**Location:** `themes/hummingbird/assets/js/theme.js`  
**Reproduction:** Open search offcanvas on mobile widths  
**Error:**
```
Unexpected token '&'
TypeError: Cannot read properties of null (reading 'innerText')
    at gr (theme.js:40:7008)
```
**Impact:** The `gr` function in theme.js attempts to read `innerText` from a null DOM element, likely related to offcanvas search initialization. Additionally, `Unexpected token '&'` suggests an unescaped ampersand character in a JSON string or API response being parsed.  
**Recommendation:** Add null-guard to the `gr` function's DOM lookup. Audit API responses for unescaped `&` characters in JSON values.

### Issue 2 (LOW): Google FedCM/Identity Services Console Errors
**Severity:** Low (non-critical, external service)  
**Location:** `accounts.google.com/gsi/client`  
**Error (recurring on every page):**
```
[GSI_LOGGER]: FedCM get() rejects with NetworkError: Error retrieving a token.
Not signed in with the identity provider.
Provider's accounts list is empty.
```
**Impact:** Purely cosmetic console noise. Google One Tap / FedCM requires a Google-authenticated browser session. In test/incognito environments this is expected. No user-facing impact.  
**Recommendation:** Consider wrapping Google Identity Services initialization in a try/catch or conditionally loading it only when a Google session is detected to suppress these expected errors.

### Issue 3 (LOW): Test Mode Banner Blocks Click Targets at Mobile Width
**Severity:** Low (test environment only)  
**Location:** `div.zcnc-testmode-front-banner` fixed at bottom  
**Reproduction:** Click targets near the bottom of viewport at 375px width  
**Impact:** The fixed test mode banner ("⚠️ MODO TEST — entorno de pruebas. Los emails NO llegan a vendedores reales.") intercepts pointer events for elements behind it on mobile viewports. This is test-environment-only but could interfere with manual QA.  
**Recommendation:** Reduce test banner height or add `pointer-events: none` to the banner background while keeping its text clickable, OR make it dismissible in test mode.

---

## Responsive Layout Verification

### Header (Mobile)
- Logo + search icon + hamburger + language options (as text) + login icon + publish link
- All elements fit on one line, no wrapping issues
- Language selector renders as plain option elements (visually shown as links/text)

### Product Detail (All Breakpoints)
- **Desktop:** Image gallery (left) + details (right) side-by-side layout
- **Tablet:** Layout collapses to stacked: gallery → details → machine data
- **Mobile:** Full vertical stack: gallery → price/year/condition/location → machine data table → description → seller info → contact form → related products
- Google Maps embed (iframe) loads correctly
- "Enviar solicitud" form with pre-filled message text works

### Login Page (All Breakpoints)
- Email + password fields + "Iniciar sesión" button
- Google OAuth "Continuar con Google" button
- "¿Olvidó su contraseña?" link
- "¿No tiene una cuenta? Cree su cuenta" link
- Centered, well-spaced layout at all sizes

### Search/Browse Page
- Search bar + facet sidebar (desktop) collapses to search-only on mobile
- Product cards stack vertically on mobile
- Pagination visible

### Footer (All Breakpoints)
- Newsletter subscription (email + "Suscríbete")
- Collapsible sections: Marketplace, Legal, Nuestra empresa, Su cuenta, Información de la tienda
- Static sections: Categorías destacadas, Marcas líderes
- Sections collapse into "Mostrar/ocultar" toggles on mobile/tablet

---

## Screenshots Generated
| File | Page | Breakpoint |
|---|---|---|
| `snap-desktop-1920.png` | Homepage | Desktop |
| `resp-mobile-product.png` | Product Detail | Mobile |
| `resp-tablet-product.png` | Product Detail | Tablet |
| `resp-mobile-login.png` | Login | Mobile |
| `resp-tablet-login.png` | Login | Tablet |
| `resp-mobile-search.png` | Search | Mobile |
| `resp-tablet-search.png` | Search | Tablet |
| `resp-desktop-search.png` | Search | Desktop |
| `resp-desktop-product.png` | Product Detail | Desktop |
| `resp-desktop-login.png` | Login | Desktop |
